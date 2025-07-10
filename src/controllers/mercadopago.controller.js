const crypto = require('crypto');
const prisma = require('../config/prisma');
const checkBonus = require('../utils/checkBonus');

// ⚠️ NOVA função para validar assinatura do Mercado Pago
function isValidSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  return signature === hash;
}

exports.webhook = async (req, res) => {
  const payment = req.body;

  console.log('🔔 Webhook recebido:', JSON.stringify(payment, null, 2));

  // 🔐 Verifica assinatura
  if (!isValidSignature(req)) {
    console.warn('🚨 Assinatura inválida do Webhook!');
    return res.status(401).json({ message: 'Assinatura inválida' });
  }

  try {
    const { id, status, external_reference } = payment.data;

    if (!external_reference) {
      return res.status(400).json({ message: 'Sem referência de pedido' });
    }

    const orderId = external_reference;

    if (status === 'approved') {
      // 🧾 Atualiza apenas a PARCELA_ENTRADA como PAGO
      const updated = await prisma.payment.updateMany({
        where: {
          orderId,
          type: 'PARCELA_ENTRADA',
        },
        data: {
          status: 'PAGO',
        },
      });

      // 🔍 Se nenhuma parcela de entrada foi atualizada, tenta atualizar AVISTA (pagamento integral)
      if (updated.count === 0) {
        await prisma.payment.updateMany({
          where: {
            orderId,
            type: 'AVISTA',
          },
          data: {
            status: 'PAGO',
          },
        });
      }

      // 🔄 Busca o pedido
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        // 🔓 Desbloqueia o usuário
        await prisma.user.update({
          where: { id: order.userId },
          data: { isBlocked: false },
        });

        // 🎁 Verifica bônus
        await checkBonus(order.userId);
      }

      console.log('✅ Pagamento aprovado: entrada ou avista marcada como paga, usuário desbloqueado');
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
};
