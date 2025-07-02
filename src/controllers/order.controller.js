const prisma = require('../config/prisma');
const dayjs = require('dayjs');
const checkInadimplencia = require('../utils/checkInadimplencia');
const checkBonus = require('../utils/checkBonus');
const mercadopago = require('mercadopago');

// 🔑 Configuração do Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

exports.createOrder = async (req, res) => {
  const { items, paymentType, dueDate } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

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

    const total = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

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

    // ✅ Se o pedido foi entregue
    if (status === 'ENTREGUE') {
      // Verifica e gera bônus da vendedora
      await checkBonus(order.userId);

      // ✅ Verifica se a vendedora tem uma líder
      if (order.user.teamLeaderId) {
        const teamLeaderId = order.user.teamLeaderId;

        // Conta vendas das afiliadas nos últimos 30 dias
        const vendasRecentes = await prisma.order.count({
          where: {
            user: {
              teamLeaderId: teamLeaderId,
            },
            status: 'ENTREGUE',
            createdAt: {
              gte: dayjs().subtract(30, 'day').toDate(),
            },
          },
        });

        const percentual = vendasRecentes >= 100 ? 10 : 7;

        // Soma do total bruto do pedido
        const totalPedido = order.items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);

        const valorComissao = (totalPedido * percentual) / 100;

        // Cria comissão para a líder
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
  const { items, address, paymentMethod } = req.body;

  if (!items || !address || !paymentMethod) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

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
      },
    };

    const result = await mercadopago.preferences.create(preference);

    res.json({
      message: 'Link de pagamento gerado com sucesso!',
      checkoutUrl: result.body.init_point,
    });
  } catch (error) {
    console.log('Erro no checkout:', error);
    res.status(500).json({ error: 'Erro ao criar link de pagamento' });
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
        user: {
          select: { id: true, name: true, email: true },
        },
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
    res.status(500).json({ error: 'Erro ao buscar pedidos com filtros', details: error.message });
  }
};
