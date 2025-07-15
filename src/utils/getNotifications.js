const dayjs = require('dayjs');
const prisma = require('../config/prisma');

async function getNotifications(user) {
  const notifications = [];

  if (user.isBlocked) {
    notifications.push({
      type: 'error',
      message: 'Você está inadimplente. Quite seus pagamentos para desbloquear novos pedidos.',
    });
  }

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

    const tresMesesAtras = dayjs().subtract(3, 'month').toDate();

    const vendasValidas = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'ENTREGUE',
        createdAt: { gte: tresMesesAtras },
        items: { some: {} },
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

  return notifications;
}

module.exports = getNotifications;
