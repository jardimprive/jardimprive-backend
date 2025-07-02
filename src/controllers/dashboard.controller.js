const prisma = require('../config/prisma');
const { subMonths, startOfMonth, endOfMonth } = require('date-fns');

// 🔒 Vendedora: dashboard individual
exports.getDashboardSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const pedidos = await prisma.order.findMany({
      where: { userId },
      include: { payments: true },
    });

    const pedidosQuitados = pedidos.filter((pedido) =>
      pedido.payments.every((p) => p.status === 'PAGO')
    );

    const valoresPedidos = await Promise.all(
      pedidosQuitados.map(async (pedido) => {
        const itens = await prisma.orderItem.findMany({
          where: { orderId: pedido.id },
        });
        return itens.reduce((sum, item) => sum + item.price * item.quantity, 0);
      })
    );

    const totalVendas = valoresPedidos.reduce((acc, val) => acc + val, 0);

    const totalComissoes = await prisma.commission.aggregate({
      where: {
        userId,
        status: 'PAGA',
      },
      _sum: { amount: true },
    });

    const totalBonus = await prisma.bonus.aggregate({
      where: {
        userId,
        status: 'PAGO',
      },
      _sum: { value: true },
    });

    const totalSaques = await prisma.withdrawalRequest.aggregate({
      where: {
        userId,
        status: 'APROVADO',
      },
      _sum: { amount: true },
    });

    res.json({
      totalVendas,
      totalComissoes: totalComissoes._sum.amount || 0,
      totalBonus: totalBonus._sum.value || 0,
      totalSaques: totalSaques._sum.amount || 0,
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados do dashboard',
      details: error.message,
    });
  }
};

// 🔴 ADMIN: dashboard geral
exports.getAdminDashboard = async (req, res) => {
  try {
    const [totalVendedoras, totalPedidos, totalComissoes, totalBonus] = await Promise.all([
      prisma.user.count({ where: { role: 'VENDEDORA' } }),
      prisma.order.count(),
      prisma.commission.aggregate({ where: { status: 'PAGA' }, _sum: { amount: true } }),
      prisma.bonus.aggregate({ where: { status: 'PAGO' }, _sum: { value: true } }),
    ]);

    const pedidosPagos = await prisma.payment.findMany({
      where: { status: 'PAGO' },
      select: { amount: true },
    });

    const totalVendas = pedidosPagos.reduce((acc, p) => acc + p.amount, 0);

    const ultimosPedidos = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        items: { select: { price: true, quantity: true } },
      },
    });

    const pedidosFormatados = ultimosPedidos.map((pedido) => {
      const total = pedido.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        id: pedido.id,
        status: pedido.status,
        vendedora: pedido.user.name,
        total,
        data: pedido.createdAt,
      };
    });

    const hoje = new Date();
    const pedidosMensais = [];

    for (let i = 5; i >= 0; i--) {
      const inicio = startOfMonth(subMonths(hoje, i));
      const fim = endOfMonth(subMonths(hoje, i));

      const pagos = await prisma.payment.findMany({
        where: {
          status: 'PAGO',
          createdAt: { gte: inicio, lte: fim },
        },
      });

      const totalMes = pagos.reduce((acc, p) => acc + p.amount, 0);

      pedidosMensais.push({
        mes: inicio.toLocaleDateString('pt-BR', { month: 'short' }),
        total: totalMes,
      });
    }

    res.json({
      totalVendedoras,
      totalPedidos,
      totalComissoes: totalComissoes._sum.amount || 0,
      totalBonus: totalBonus._sum.value || 0,
      totalVendas,
      ultimosPedidos: pedidosFormatados,
      pedidosMensais,
    });
  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard admin' });
  }
};

// 🧩 Histórico unificado da vendedora
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const pedidos = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        status: true,
        _count: true,
      },
    });

    const pedidosFormatados = pedidos.map((p) => ({
      tipo: 'PEDIDO',
      id: p.id,
      data: p.createdAt,
      status: p.status,
      descricao: `Pedido com ${p._count} item(s)`,
    }));

    const saques = await prisma.withdrawalRequest.findMany({
      where: { userId },
    });

    const saquesFormatados = saques.map((s) => ({
      tipo: 'SAQUE',
      id: s.id,
      data: s.createdAt,
      status: s.status,
      descricao: `Saque de R$ ${s.amount.toFixed(2)}`,
    }));

    const comissoes = await prisma.commission.findMany({
      where: { userId },
    });

    const comissoesFormatadas = comissoes.map((c) => ({
      tipo: 'COMISSAO',
      id: c.id,
      data: c.createdAt,
      status: c.status,
      descricao: `Comissão de R$ ${c.amount.toFixed(2)}`,
    }));

    const bonus = await prisma.bonus.findMany({
      where: { userId },
    });

    const bonusFormatados = bonus.map((b) => ({
      tipo: 'BONUS',
      id: b.id,
      data: b.createdAt,
      status: b.status,
      descricao: `Bônus ${b.type} de R$ ${b.value.toFixed(2)}`,
    }));

    const historico = [
      ...pedidosFormatados,
      ...saquesFormatados,
      ...comissoesFormatadas,
      ...bonusFormatados,
    ];

    historico.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico de atividades',
      details: error.message,
    });
  }
};

// 🔍 Obter detalhes de uma atividade específica
exports.getAtividadeDetalhada = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.query;
  const userId = req.user.id;

  try {
    let resultado;

    switch (tipo) {
      case 'PEDIDO':
        resultado = await prisma.order.findUnique({
          where: { id },
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
            payments: true,
          },
        });
        break;

      case 'SAQUE':
        resultado = await prisma.withdrawalRequest.findUnique({
          where: { id },
        });
        break;

      case 'BONUS':
        resultado = await prisma.bonus.findUnique({
          where: { id },
        });
        break;

      case 'COMISSAO':
        resultado = await prisma.commission.findUnique({
          where: { id },
        });
        break;

      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    if (!resultado || resultado.userId !== userId) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar detalhes da atividade:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes' });
  }
};
