const prisma = require('../config/prisma');
const dayjs = require('dayjs');

exports.getMyGoalProgress = async (req, res) => {
  try {
    const threeMonthsAgo = dayjs().subtract(3, 'month').toDate();

    const validOrders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: threeMonthsAgo },
        payments: { every: { status: 'PAGO' } },
        items: {
          some: {},
        },
      },
      include: { items: true },
    });

    // Filtrar pedidos com valor ≥ 250
    const validSales = validOrders.filter(order => {
      const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total >= 250;
    });

    const salesCount = validSales.length;
    const bonusEarned = Math.floor(salesCount / 10) * 200;
    const nextBonusIn = 10 - (salesCount % 10);

    const hotelAchieved = salesCount >= 60;

    res.json({
      salesCount,
      bonusEarned,
      nextBonusIn,
      hotelAchieved,
      progressPercent: Math.min((salesCount / 60) * 100, 100),
    });
  } catch (error) {
    console.error('Erro no progresso da meta:', error);
    res.status(500).json({ error: 'Erro ao calcular progresso da meta' });
  }
};
