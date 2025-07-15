const prisma = require('../config/prisma');
const dayjs = require('dayjs');

exports.getNotifications = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const notifications = [];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 🚫 Notificação de bloqueio
    if (user.isBlocked) {
      notifications.push({
        type: 'error',
        title: 'Conta bloqueada',
        icon: '🚫',
        message: 'Você está inadimplente. Quite seus pagamentos para desbloquear novos pedidos.',
      });
    }

    // 👑 Notificações para ADMIN
    if (user.role === 'ADMIN') {
      const saquesPendentes = await prisma.withdrawalRequest.count({
        where: { status: 'PENDENTE' },
      });

      if (saquesPendentes > 0) {
        notifications.push({
          type: 'info',
          title: 'Saques pendentes',
          icon: '📥',
          message: `Você tem ${saquesPendentes} solicitações de saque pendentes para analisar.`,
        });
      }
    }

    // 👩‍💼 Notificações para VENDEDORA
    if (user.role === 'VENDEDORA') {
      const bonusPendentes = await prisma.bonus.count({
        where: {
          userId: user.id,
          status: 'PENDENTE',
        },
      });

      if (bonusPendentes > 0) {
        notifications.push({
          type: 'info',
          title: 'Bônus pendente',
          icon: '💰',
          message: `Você tem ${bonusPendentes} bônus aguardando pagamento.`,
        });
      }

      const tresMesesAtras = dayjs().subtract(3, 'month').toDate();

      const vendasValidas = await prisma.order.findMany({
        where: {
          userId: user.id,
          status: 'ENTREGUE',
          createdAt: {
            gte: tresMesesAtras,
          },
          items: {
            some: {},
          },
        },
        include: {
          items: true,
        },
      });

      const vendasMinimas = vendasValidas.filter((pedido) => {
        const total = pedido.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return total >= 250;
      });

      const totalValidas = vendasMinimas.length;
      const metas = [10, 20, 30, 40, 50, 60];

      metas.forEach((meta) => {
        if (totalValidas >= meta) {
          notifications.push({
            type: 'success',
            title: `Meta ${meta} atingida`,
            icon: '🏆',
            message: `Parabéns! Você atingiu a meta de ${meta} vendas com pedidos acima de R$250.`,
          });
        }
      });
    }

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      error: 'Erro ao buscar notificações',
      details: error.message,
    });
  }
};
