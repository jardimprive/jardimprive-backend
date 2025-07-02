const prisma = require('../config/prisma');

// ✅ Vendedora: listar suas comissões
exports.getMyCommissions = async (req, res) => {
  const commissions = await prisma.commission.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(commissions);
};

// ✅ Admin: listar todas as comissões
exports.getAllCommissions = async (req, res) => {
  const commissions = await prisma.commission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, order: true },
  });
  res.json(commissions);
};

// ✅ Admin: atualizar status da comissão (ex: PENDENTE → PAGA)
exports.updateCommissionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDENTE', 'PAGA', 'CANCELADA'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const updated = await prisma.commission.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar comissão', details: error.message });
  }
};
