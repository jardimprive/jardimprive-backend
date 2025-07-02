const prisma = require('../config/prisma');
const { startOfMonth, endOfMonth } = require('date-fns');

// 🔒 Painel da Líder de Equipe
exports.getDashboard = async (req, res) => {
  const leaderId = req.user.id;

  try {
    // 🔎 Busca todas as vendedoras da equipe
    const equipe = await prisma.user.findMany({
      where: { referredById: leaderId },
      select: { id: true, name: true },
    });

    const vendedoraIds = equipe.map(v => v.id);

    // 🧾 Filtra os pedidos válidos do mês atual
    const pedidos = await prisma.order.findMany({
      where: {
        userId: { in: vendedoraIds },
        status: 'ENTREGUE',
        createdAt: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
      include: {
        items: true,
      },
    });

    // 📦 Total de vendas
    const totalVendas = pedidos.length;

    // 💰 Valor bruto das vendas
    const valorBruto = pedidos.reduce((total, pedido) => {
      const subtotal = pedido.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total + subtotal;
    }, 0);

    // 📈 Comissão
    const percentual = totalVendas >= 100 ? 0.10 : 0.07;
    const valorComissao = valorBruto * percentual;

    res.json({
      totalVendedoras: equipe.length,
      totalVendas,
      valorBruto: valorBruto.toFixed(2),
      percentual: percentual * 100,
      valorComissao: valorComissao.toFixed(2),
    });
  } catch (err) {
    console.error('Erro no painel da líder:', err);
    res.status(500).json({ error: 'Erro ao carregar painel da líder', details: err.message });
  }
};
