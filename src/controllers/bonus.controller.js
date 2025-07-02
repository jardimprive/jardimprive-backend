const prisma = require('../config/prisma');

// 🔒 Vendedora: ver seus bônus
exports.getMyBonuses = async (req, res) => {
  const bonuses = await prisma.bonus.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bonuses);
};

// 🔒 Admin: ver todos os bônus (rota protegida com isAdmin)
exports.getAllBonusesAdmin = async (req, res) => {
  try {
    const bonuses = await prisma.bonus.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(bonuses);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar bônus',
      details: error.message,
    });
  }
};

// 🔄 Progresso da meta da vendedora
exports.getProgress = async (req, res) => {
  try {
    const vendasValidas = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        status: 'ENTREGUE',
        isBlocked: false,
        items: {
          some: {}, // só precisa ter produtos
        },
        payments: {
          every: { status: 'PAGO' },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Somar apenas vendas com total >= 250
    const vendasFiltradas = vendasValidas.filter((pedido) => {
      const total = pedido.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return total >= 250;
    });

    const totalVendasValidas = vendasFiltradas.length;
    const totalBonus = Math.floor(totalVendasValidas / 10) * 200;
    const progresso = Math.min((totalVendasValidas / 60) * 100, 100);
    const ganhouHotel = totalVendasValidas >= 60;

    res.json({
      totalVendasValidas,
      totalBonus,
      progresso,
      ganhouHotel,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao calcular progresso da meta',
      details: error.message,
    });
  }
};
