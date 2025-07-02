const prisma = require('../config/prisma');
const { Parser } = require('json2csv');

// ⛳ Função principal
exports.exportCSV = async (req, res) => {
  const { type } = req.params;

  try {
    let data = [];

    // 🔄 Dependendo do tipo de exportação
    if (type === 'pedidos') {
      data = await prisma.order.findMany({
        include: {
          user: true,
          items: {
            include: {
              variation: {
                include: { product: true }
              }
            }
          }
        }
      });

      // 🧾 Transformamos os pedidos em linhas de planilha
      const rows = data.map((p) => {
        const total = p.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
          PedidoID: p.id,
          Nome: p.user.name,
          Email: p.user.email,
          Total: total,
          Status: p.status,
          CriadoEm: p.createdAt,
        };
      });

      const csv = new Parser().parse(rows);
      return res.header('Content-Type', 'text/csv').attachment('pedidos.csv').send(csv);
    }

    // 🔸 Comissões
    if (type === 'comissoes') {
      data = await prisma.commission.findMany({
        include: { user: true },
      });

      const rows = data.map((c) => ({
        Nome: c.user.name,
        Email: c.user.email,
        Valor: c.amount,
        Status: c.status,
        CriadoEm: c.createdAt,
      }));

      const csv = new Parser().parse(rows);
      return res.header('Content-Type', 'text/csv').attachment('comissoes.csv').send(csv);
    }

    // 🔸 Bônus
    if (type === 'bonus') {
      data = await prisma.bonus.findMany({
        include: { user: true },
      });

      const rows = data.map((b) => ({
        Nome: b.user.name,
        Email: b.user.email,
        Tipo: b.type,
        Valor: b.value,
        Status: b.status,
        CriadoEm: b.createdAt,
      }));

      const csv = new Parser().parse(rows);
      return res.header('Content-Type', 'text/csv').attachment('bonus.csv').send(csv);
    }

    // 🔸 Saques
    if (type === 'saques') {
      data = await prisma.withdrawalRequest.findMany({
        include: { user: true },
      });

      const rows = data.map((w) => ({
        Nome: w.user.name,
        Email: w.user.email,
        Valor: w.amount,
        PIX: w.pixKey,
        Status: w.status,
        CriadoEm: w.createdAt,
      }));

      const csv = new Parser().parse(rows);
      return res.header('Content-Type', 'text/csv').attachment('saques.csv').send(csv);
    }

    // 🚫 Tipo inválido
    return res.status(400).json({ error: 'Tipo inválido' });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    return res.status(500).json({ error: 'Erro ao exportar', details: error.message });
  }
};
