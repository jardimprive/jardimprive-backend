const prisma = require('../config/prisma');

const checkInadimplencia = async (userId) => {
  const pagamentosAtrasados = await prisma.payment.findMany({
    where: {
      order: {
        userId,
      },
      status: 'ATRASADO',
    },
  });

  if (pagamentosAtrasados.length >= 3) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        status: 'INADIMPLENTE',
      },
    });
    return true; // Está bloqueado
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        status: 'ATIVA',
      },
    });
    return false; // Está liberado
  }
};

module.exports = checkInadimplencia;
