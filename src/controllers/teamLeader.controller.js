const prisma = require('../config/prisma');
const dayjs = require('dayjs');

// 🔐 Painel da líder: dashboard com resumo
exports.getLiderDashboard = async (req, res) => {
  try {
    const leaderId = req.user.id;

    // Busca todas as vendedoras cadastradas com o código da líder
    const vendedoras = await prisma.user.findMany({
      where: {
        invitedById: leaderId,
        role: 'VENDEDORA',
      },
    });

    const vendedoraIds = vendedoras.map((v) => v.id);

    // Pedidos ENTREGUES nos últimos 30 dias
    const ultimosPedidos = await prisma.order.findMany({
      where: {
        userId: { in: vendedoraIds },
        status: 'ENTREGUE',
        createdAt: {
          gte: dayjs().subtract(30, 'days').toDate(),
        },
      },
      include: {
        user: true,
        items: true,
      },
    });

    const totalVendas = ultimosPedidos.reduce((acc, pedido) => {
      return acc + pedido.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const totalVendasPorVendedora = {};

    for (const pedido of ultimosPedidos) {
      const userId = pedido.user.id;
      const nome = pedido.user.name;
      const email = pedido.user.email;

      const totalPedido = pedido.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (!totalVendasPorVendedora[userId]) {
        totalVendasPorVendedora[userId] = {
          name: nome,
          email,
          totalVendido: 0,
        };
      }

      totalVendasPorVendedora[userId].totalVendido += totalPedido;
    }

    const minhasVendedoras = Object.values(totalVendasPorVendedora);

    const percentual =
      ultimosPedidos.length >= 100 ? 10 : 7;

    const comissaoEstimativa = (totalVendas * percentual) / 100;

    res.json({
      totalVendas,
      totalVendedoras: vendedoras.length,
      percentual,
      comissaoEstimativa,
      minhasVendedoras,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados da equipe', details: error.message });
  }
};

// 📄 Extrato: lista de comissões da equipe
exports.getComissoesEquipe = async (req, res) => {
  try {
    const leaderId = req.user.id;

    const comissoes = await prisma.teamLeaderCommission.findMany({
      where: { leaderId },
      include: {
        seller: {
          select: { name: true, email: true },
        },
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comissoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comissões da equipe', details: error.message });
  }
};

// 💰 Ver saldo disponível para saque
exports.getSaldoLider = async (req, res) => {
  try {
    const leaderId = req.user.id;

    const comissoesPagas = await prisma.teamLeaderCommission.aggregate({
      where: {
        leaderId,
        status: 'PAGO',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPago = comissoesPagas._sum.amount || 0;

    const comissoesPendentes = await prisma.teamLeaderCommission.aggregate({
      where: {
        leaderId,
        status: 'PENDENTE',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPendente = comissoesPendentes._sum.amount || 0;

    res.json({
      totalRecebido: totalPago,
      saldoDisponivel: totalPendente,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular saldo da líder', details: error.message });
  }
};
