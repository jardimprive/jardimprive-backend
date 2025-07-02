const prisma = require('../config/prisma');
const checkBonus = require('../utils/checkBonus'); // ✅ IMPORTADO

exports.webhook = async (req, res) => {
  const payment = req.body;

  console.log('🔔 Webhook recebido:', JSON.stringify(payment, null, 2));

  try {
    const { id, status, external_reference } = payment.data;

    if (!external_reference) {
      return res.status(400).json({ message: 'Sem referência de pedido' });
    }

    const orderId = external_reference;

    if (status === 'approved') {
      // 🔥 Atualiza pagamentos do pedido como pagos
      await prisma.payment.updateMany({
        where: {
          orderId,
        },
        data: {
          status: 'PAGO',
        },
      });

      // 🔥 Busca o pedido
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        // 🔓 Desbloqueia o usuário, se estava bloqueado
        await prisma.user.update({
          where: { id: order.userId },
          data: { isBlocked: false },
        });

        // 🎯 Verifica bônus após pagamento
        await checkBonus(order.userId);
      }

      console.log('💰 Pagamento aprovado, usuário desbloqueado e bônus verificado');
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
};
