const prisma = require('../config/prisma');

exports.getMyLogins = async (req, res) => {
  try {
    const logs = await prisma.loginHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico de login.' });
  }
};
