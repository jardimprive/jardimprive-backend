const prisma = require('../config/prisma');
const dayjs = require('dayjs');

exports.getNotifications = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const notifications = [];

    // 🔴 Bloqueado por inadimplência
    if (user.isBlocked) {
      notifications.push({
        type: 'error',
        message: 'Você está inadimplente. Quite seus pagamentos para desbloquear novos pedidos.',
      });
    }

    // 🟢 Admin: ver se há saques pendentes
    if (user.role === 'ADMIN') {
      const saquesPendentes = await prisma.withdrawalRequest.count({
        where: { status: 'PENDENTE' },
      });

      if (saquesPendentes > 0) {
        notifications.push({
          type: 'info',
          message: `Você tem ${saquesPendentes} solicitações de saque pendentes para analisar.`,
        });
      }
    }

    // 🟨 Bônus pendentes
    if (user.role === 'VENDEDORA') {
      const bonusPendentes = await prisma.bonus.count({
        where: { userId: user.id, status: 'PENDENTE' },
      });

      if (bonusPendentes > 0) {
        notifications.push({
          type: 'info',
          message: `Você tem ${bonusPendentes} bônus aguardando pagamento.`,
        });
      }
    }

    // 🏆 Metas atingidas
    if (user.role === 'VENDEDORA') {
      const tresMesesAtras = dayjs().subtract(3, 'month').toDate();

      const vendasValidas = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: 'ENTREGUE',
          createdAt: { gte: tresMesesAtras },
          items: {
            some: {},
          },
        },
        include: { items: true },
      });

      const vendasMinimas = vendasValidas.filter((pedido) => {
        const total = pedido.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return total >= 250;
      });

      const totalValidas = vendasMinimas.length;

      const metas = [10, 20, 30, 40, 50, 60];
      metas.forEach((m) => {
        if (totalValidas >= m) {
          notifications.push({
            type: 'success',
            message: `Parabéns! Você atingiu a meta de ${m} vendas com pedidos acima de R$250.`,
          });
        }
      });
    }

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações', details: error.message });
  }
};
