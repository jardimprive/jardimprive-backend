const prisma = require('../config/prisma');
const dayjs = require('dayjs');
const checkInadimplencia = require('../utils/checkInadimplencia');
const checkBonus = require('../utils/checkBonus');

const mercadopago = require('mercadopago');

// 🔑 Configure suas credenciais aqui:
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN, // 🔥 Salva no .env depois
});

// ✅ 🔥 Gerar link de pagamento (Checkout Mercado Pago)
exports.createCheckout = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const items = order.items.map((item) => ({
      title: `${item.variation.product.name} - ${item.variation.size}`,
      quantity: item.quantity,
      currency_id: 'BRL',
      unit_price: item.price,
    }));

    const preference = {
      items,
      payer: {
        name: 'Cliente',
      },
      back_urls: {
        success: 'https://www.seusite.com/success', // 🔥 coloque a URL real
        failure: 'https://www.seusite.com/failure',
        pending: 'https://www.seusite.com/pending',
      },
      auto_return: 'approved',
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ checkoutUrl: response.body.init_point });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ error: 'Erro ao criar checkout' });
  }
};



// ✅ Listar pagamentos do usuário
exports.getMyPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: {
      order: {
        userId: req.user.id,
      },
    },
    include: {
      order: true,
    },
  });

  res.json(payments);
};


// ✅ Confirmar pagamento manual
exports.payPayment = async (req, res) => {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      order: true,
    },
  });

  if (!payment) {
    return res.status(404).json({ error: 'Pagamento não encontrado' });
  }

  if (payment.status === 'PAGO') {
    return res.status(400).json({ error: 'Pagamento já está quitado' });
  }

  await prisma.payment.update({
    where: { id },
    data: {
      status: 'PAGO',
    },
  });

  const pagamentosDoPedido = await prisma.payment.findMany({
    where: {
      orderId: payment.orderId,
    },
  });

  const pedidoQuitado = pagamentosDoPedido.every((p) => p.status === 'PAGO');

  const itens = await prisma.orderItem.findMany({
    where: { orderId: payment.orderId },
  });

  const total = itens.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  let comissaoExistente = await prisma.commission.findFirst({
    where: {
      orderId: payment.orderId,
    },
  });

  if (!comissaoExistente) {
    comissaoExistente = await prisma.commission.create({
      data: {
        userId: payment.order.userId,
        orderId: payment.orderId,
        amount: total * 0.25,
        status: 'PENDENTE',
      },
    });
  }

  if (
    payment.type === 'PARCELA_ENTRADA' ||
    payment.type === 'PARCELA_FINAL'
  ) {
    const metade = comissaoExistente.amount / 2;

    if (payment.type === 'PARCELA_ENTRADA') {
      await prisma.commission.update({
        where: { id: comissaoExistente.id },
        data: {
          amount: metade,
        },
      });
    }

    if (payment.type === 'PARCELA_FINAL') {
      await prisma.commission.update({
        where: { id: comissaoExistente.id },
        data: {
          amount: comissaoExistente.amount + metade,
        },
      });
    }
  }

  if (pedidoQuitado) {
    await prisma.commission.update({
      where: { id: comissaoExistente.id },
      data: {
        amount: total * 0.25,
      },
    });

    await prisma.user.update({
      where: { id: payment.order.userId },
      data: {
        isBlocked: false,
      },
    });

    await checkBonus(payment.order.userId);
  }

  await checkInadimplencia(payment.order.userId);

  res.json({ message: 'Pagamento realizado com sucesso' });
};
