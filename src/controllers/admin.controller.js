const prisma = require('../config/prisma');

// ✅ Listar todas as vendedoras (apenas ADMIN pode ver isso)
exports.getAllVendedoras = async (req, res) => {
  try {
    const vendedoras = await prisma.user.findMany({
      where: {
        role: 'VENDEDORA',
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(vendedoras);
  } catch (error) {
    console.error('Erro ao buscar vendedoras:', error);
    res.status(500).json({ error: 'Erro ao buscar vendedoras' });
  }
};
// 🔍 Buscar vendedora por ID (admin)
exports.getVendedoraById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        address: true,
        photo: true,
        status: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== 'VENDEDORA') {
      return res.status(404).json({ error: 'Vendedora não encontrada.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar vendedora:', error);
    res.status(500).json({ error: 'Erro interno ao buscar vendedora.' });
  }
};