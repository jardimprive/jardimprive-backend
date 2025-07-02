const prisma = require('../config/prisma');

module.exports = async (req, res, next) => {
  if (!req.user || !req.user.id) return next();

  try {
    await prisma.loginHistory.create({
      data: {
        userId: req.user.id,
        ip: req.ip || req.headers['x-forwarded-for'] || 'Desconhecido',
        userAgent: req.headers['user-agent'] || '',
      },
    });
  } catch (err) {
    console.error('Erro ao registrar login:', err.message);
  }

  next();
};
