// order.controller.js
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

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType,
        items: {
          create: items.map((item) => ({
            variationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          })),
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
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          variation: true,
        },
      },
    },
  });
  res.json(orders);
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

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType: paymentMethod,
        items: {
          create: items.map((item) => ({
            variationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          })),
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

    const preference = {
      items: mpItems,
      back_urls: {
        success: process.env.MP_SUCCESS_URL,
        failure: process.env.MP_FAILURE_URL,
        pending: process.env.MP_PENDING_URL,
      },
      auto_return: 'approved',
      metadata: {
        userId: req.user.id,
        paymentType: 'AVISTA',
      },
    };

    const result = await mercadopago.preferences.create(preference);
    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro ao criar link PIX:', error);
    res.status(500).json({ error: 'Erro ao gerar link de pagamento PIX', details: error.message });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentType } = req.query;
    const where = {};

    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (paymentType) where.paymentType = paymentType;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            variation: { include: { product: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos com filtros', details: error.message });
  }
};

exports.createOrderEntrada = async (req, res) => {
  const { items, address, paymentMethod } = req.body;

  if (!items || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || user.isBlocked) {
      return res.status(403).json({ error: 'Usuário bloqueado por inadimplência' });
    }

    const produtos = await Promise.all(
      items.map(async (item) => {
        const variation = await prisma.productVariation.findUnique({
          where: { id: item.variationId },
          include: { product: true },
        });
        if (!variation) throw new Error('Produto não encontrado');
        return { variation, quantity: item.quantity };
      })
    );

    const total = produtos.reduce((acc, { variation, quantity }) => acc + variation.price * quantity, 0);
    const entrada = total * 0.5;
    const restante = total - entrada;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        paymentType: 'PARCELADO',
        items: {
          create: items.map((item) => ({
            variationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    await prisma.payment.createMany({
      data: [
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
          dueDate: dayjs().add(30, 'day').toDate(),
          status: 'PENDENTE',
        },
      ],
    });

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
        paymentType: 'PARCELADO',
      },
      external_reference: String(order.id),
    };

    const result = await mercadopago.preferences.create(preference);

    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro no pedido 50/50:', error);
    res.status(500).json({ error: 'Erro ao criar pedido 50/50', details: error.message });
  }
};
exports.createOrderFinal = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  if (!orderId || !paymentMethod) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            variation: { include: { product: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const user = order.user;
    if (!user || user.isBlocked) {
      return res.status(403).json({ error: 'Usuário bloqueado por inadimplência' });
    }

    const parcelaFinal = order.payments.find(p => p.type === 'PARCELA_FINAL');
    if (!parcelaFinal) {
      return res.status(400).json({ error: 'Parcela final não encontrada para este pedido' });
    }

    if (parcelaFinal.status === 'PAGO') {
      return res.status(400).json({ error: 'Parcela final já está paga' });
    }

    const preference = {
      items: [
        {
          title: `Parcela Final do pedido #${order.id}`,
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
        userId: user.id,
        orderId: order.id,
        paymentType: 'PARCELADO',
      },
      external_reference: String(order.id),
    };

    const result = await mercadopago.preferences.create(preference);
    res.status(200).json({ checkoutUrl: result.body.init_point });
  } catch (error) {
    console.error('Erro ao gerar link da parcela final:', error);
    res.status(500).json({ error: 'Erro ao gerar pagamento da parcela final', details: error.message });
  }
};
