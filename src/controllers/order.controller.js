const prisma = require('../config/prisma');
const dayjs = require('dayjs');
const checkInadimplencia = require('../utils/checkInadimplencia');
const checkBonus = require('../utils/checkBonus');
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

exports.createOrder = async (req, res) => {
  const { items, paymentType, dueDate } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.isBlocked) {
      return res.status(403).json({
        error: 'Você está bloqueado por inadimplência. Quite seus pagamentos para continuar.',
      });
    }

    // VALIDAÇÃO DE PREÇOS VINDOS DO BANCO
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const variation = await prisma.productVariation.findUnique({
          where: { id: item.variationId },
        });
        if (!variation) throw new Error('Produto não encontrado');
        return {
          variationId: item.variationId,
          quantity: item.quantity,
          price: variation.price,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType,
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: {
          include: {
            variation: true,
          },
        },
      },
    });

    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const payments = [];

    if (paymentType === 'AVISTA' || paymentType === 'CARTAO') {
      payments.push({
        orderId: order.id,
        type: 'AVISTA',
        amount: total,
        dueDate: dayjs().toDate(),
        status: 'PENDENTE',
      });
    }

    if (paymentType === 'PARCELADO') {
      const entrada = total * 0.5;
      const restante = total * 0.5;

      payments.push(
        {
          orderId: order.id,
          type: 'PARCELA_ENTRADA',
          amount: entrada,
          dueDate: dayjs().toDate(),
          status: 'PENDENTE',
        },
        {
          orderId: order.id,
          type: 'PARCELA_FINAL',
          amount: restante,
          dueDate: dayjs(dueDate).toDate(),
          status: 'PENDENTE',
        }
      );
    }

    await prisma.payment.createMany({ data: payments });
    await checkInadimplencia(req.user.id);

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar pedido', details: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos', details: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variation: true,
        },
      },
    },
  });

  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(order);
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, trackingCode } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingCode,
      },
      include: {
        user: true,
        items: true,
      },
    });

    if (status === 'ENTREGUE') {
      await checkBonus(order.userId);

      if (order.user.teamLeaderId) {
        const teamLeaderId = order.user.teamLeaderId;

        const vendasRecentes = await prisma.order.count({
          where: {
            user: { teamLeaderId },
            status: 'ENTREGUE',
            createdAt: { gte: dayjs().subtract(30, 'day').toDate() },
          },
        });

        const percentual = vendasRecentes >= 100 ? 10 : 7;

        const totalPedido = order.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const valorComissao = (totalPedido * percentual) / 100;

        await prisma.teamLeaderCommission.create({
          data: {
            leaderId: teamLeaderId,
            sellerId: order.user.id,
            orderId: order.id,
            value: valorComissao,
            percentage: percentual,
          },
        });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar pedido', details: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar pedido', details: error.message });
  }
};

exports.createOrderWithCheckout = async (req, res) => {
  const { items, address, paymentMethod, dueDate } = req.body;

  if (!items || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Você está bloqueado por inadimplência. Quite seus pagamentos.' });
    }

    // VALIDAÇÃO DE PREÇOS VINDOS DO BANCO
    const mpItems = await Promise.all(
      items.map(async (item) => {
        const variation = await prisma.productVariation.findUnique({
          where: { id: item.variationId },
          include: { product: true },
        });
        if (!variation) throw new Error('Produto não encontrado');
        return {
          title: `${variation.product.name} - ${variation.size}`,
          quantity: item.quantity,
          unit_price: variation.price,
          currency_id: 'BRL',
        };
      })
    );

    const total = mpItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const entrada = total * 0.5;

    // CRIAÇÃO DOS ITENS DO PEDIDO USANDO PREÇOS VALIDADOS
    const validatedItems = mpItems.map(mpItem => ({
      variationId: items.find(i => i.variationId === mpItem.title.split(' - ')[1])?.variationId || null,
      quantity: mpItem.quantity,
      price: mpItem.unit_price,
    }));

    // Melhor forma (melhor garantir pelo índice)
    const validatedItemsForOrder = items.map(item => {
      const variation = mpItems.find(mp => mp.title.includes(item.variationId)); 
      return {
        variationId: item.variationId,
        quantity: item.quantity,
        price: mpItems.find(mp => mp.title.includes(item.variationId))?.unit_price || 0,
      }
    });

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType: paymentMethod,
        items: {
          create: validatedItemsForOrder,
        },
      },
    });

    const payments = [];

    if (paymentMethod === 'PARCELADO') {
      payments.push(
        {
          orderId: order.id,
          type: 'PARCELA_ENTRADA',
          amount: entrada,
          dueDate: dayjs().toDate(),
          status: 'PENDENTE',
        },
        {
          orderId: order.id,
          type: 'PARCELA_FINAL',
          amount: total - entrada,
          dueDate: dayjs(dueDate).toDate(),
          status: 'PENDENTE',
        }
      );
    } else {
      payments.push({
        orderId: order.id,
        type: 'AVISTA',
        amount: total,
        dueDate: dayjs().toDate(),
        status: 'PENDENTE',
      });
    }

    await prisma.payment.createMany({ data: payments });

    const preference = {
      items: [
        {
          title: `Entrada do pedido #${order.id}`,
          quantity: 1,
          unit_price: entrada,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      auto_return: 'approved',
      metadata: {
        userId: req.user.id,
        orderId: order.id,
        paymentType: paymentMethod,
      },
      external_reference: String(order.id),
    };

    const result = await mercadopago.preferences.create(preference);

    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro no checkout:', error);
    res.status(500).json({ error: 'Erro ao criar link de pagamento', details: error.message });
  }
};

exports.createOrderPix = async (req, res) => {
  const { items, address } = req.body;

  if (!items || !address) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || user.isBlocked) {
      return res.status(403).json({ error: 'Usuário bloqueado por inadimplência' });
    }

    const mpItems = await Promise.all(
      items.map(async (item) => {
        const variation = await prisma.productVariation.findUnique({
          where: { id: item.variationId },
          include: { product: true },
        });
        if (!variation) throw new Error('Produto não encontrado');

        return {
          title: `${variation.product.name} - ${variation.size}`,
          quantity: item.quantity,
          unit_price: variation.price,
          currency_id: 'BRL',
        };
      })
    );

    const total = mpItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const variation = await prisma.productVariation.findUnique({
          where: { id: item.variationId },
        });
        if (!variation) throw new Error('Produto não encontrado');

        return {
          variationId: item.variationId,
          quantity: item.quantity,
          price: variation.price,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType: 'PIX',
        items: {
          create: orderItems,
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        type: 'PIX',
        amount: total,
        dueDate: dayjs().toDate(),
        status: 'PENDENTE',
      },
    });

    const preference = {
      items: mpItems,
      payment_methods: {
        excluded_payment_types: [{ id: 'credit_card' }, { id: 'ticket' }],
      },
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      auto_return: 'approved',
      metadata: {
        userId: req.user.id,
        orderId: order.id,
        paymentType: 'PIX',
      },
      external_reference: String(order.id),
    };

    const result = await mercadopago.preferences.create(preference);

    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro no checkout PIX:', error);
    res.status(500).json({ error: 'Erro ao criar link PIX', details: error.message });
  }
};

exports.createOrderFinal = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const parcelaFinal = order.payments.find((p) => p.type === 'PARCELA_FINAL');

    if (!parcelaFinal) {
      return res.status(400).json({ error: 'Parcela final não encontrada para este pedido' });
    }

    const preference = {
      items: [
        {
          title: `Parcela final do pedido #${order.id}`,
          quantity: 1,
          unit_price: parcelaFinal.amount,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      auto_return: 'approved',
      metadata: {
        userId: order.userId,
        orderId: order.id,
        paymentType: 'PARCELA_FINAL',
      },
      external_reference: String(order.id),
    };

    const result = await mercadopago.preferences.create(preference);

    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro no checkout parcela final:', error);
    res.status(500).json({ error: 'Erro ao criar link de pagamento final', details: error.message });
  }
};
