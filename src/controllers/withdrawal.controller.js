const prisma = require('../config/prisma');

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, pixKey } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Informe um valor válido para saque.' });
    }

    if (!pixKey) {
      return res.status(400).json({ error: 'Informe sua chave PIX.' });
    }

    // 🔥 Calcula saldo disponível

    const commissions = await prisma.commission.findMany({
      where: { userId: req.user.id, status: 'PENDENTE' },
    });

    const bonuses = await prisma.bonus.findMany({
      where: { userId: req.user.id, status: 'PENDENTE' },
    });

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId: req.user.id, status: { in: ['PENDENTE', 'APROVADO'] } },
    });

    const totalCommissions = commissions.reduce((acc, item) => acc + item.amount, 0);
    const totalBonuses = bonuses.reduce((acc, item) => acc + item.amount, 0);
    const totalWithdrawals = withdrawals.reduce((acc, item) => acc + item.amount, 0);

    const saldoDisponivel = totalCommissions + totalBonuses - totalWithdrawals;

    if (amount > saldoDisponivel) {
      return res.status(400).json({ error: 'Valor maior que o saldo disponível.' });
    }

    // 🔥 Cria solicitação de saque
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: req.user.id,
        amount,
        pixKey,
        status: 'PENDENTE',
      },
    });

    res.json({ message: 'Saque solicitado com sucesso!', withdrawal });
  } catch (error) {
    console.error('Erro no saque:', error);
    res.status(500).json({ error: 'Erro ao solicitar saque', details: error.message });
  }
};

exports.getMyWithdrawals = async (req, res) => {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(withdrawals);
};

exports.getAllWithdrawals = async (req, res) => {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });

  res.json(withdrawals);
};

exports.updateWithdrawalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id },
  });

  if (!withdrawal) {
    return res.status(404).json({ error: 'Solicitação não encontrada' });
  }

  if (!['APROVADO', 'RECUSADO'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  // 🔥 Atualiza o status
  await prisma.withdrawalRequest.update({
    where: { id },
    data: { status },
  });

  if (status === 'APROVADO') {
    // 🔥 Marca as comissões como PAGA
    await prisma.commission.updateMany({
      where: {
        userId: withdrawal.userId,
        status: 'PENDENTE',
      },
      data: {
        status: 'PAGA',
      },
    });

    // 🔥 Marca os bônus como PAGO
    await prisma.bonus.updateMany({
      where: {
        userId: withdrawal.userId,
        status: 'PENDENTE',
      },
      data: {
        status: 'PAGO',
      },
    });
  }

  res.json({ message: `Saque ${status.toLowerCase()} com sucesso.` });
};
