const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// 🔒 GET /profile/me
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        photo: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil', details: error.message });
  }
};

// ✏️ PUT /profile/me
exports.updateProfile = async (req, res) => {
  const { name, cpf, photo } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        cpf,
        photo,
      },
    });

    res.json({ message: 'Perfil atualizado com sucesso', user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
  }
};

// 🔑 PUT /profile/password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar senha', details: error.message });
  }
};

// 🧩 NOVO: GET /profile/atividades
exports.getAtividades = async (req, res) => {
  try {
    const userId = req.user.id;

    const pedidos = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    const saques = await prisma.withdrawalRequest.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const bonus = await prisma.bonus.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        value: true,
        status: true,
        createdAt: true,
      },
    });

    // Junta e ordena todas as atividades por data (desc)
    const atividades = [
      ...pedidos.map((p) => ({
        tipo: 'Pedido',
        id: p.id,
        status: p.status,
        info: `${p._count.items} item(s)`,
        data: p.createdAt,
      })),
      ...saques.map((s) => ({
        tipo: 'Saque',
        id: s.id,
        status: s.status,
        info: `R$ ${s.amount.toFixed(2)}`,
        data: s.createdAt,
      })),
      ...bonus.map((b) => ({
        tipo: 'Bônus',
        id: b.id,
        status: b.status,
        info: `${b.type} - R$ ${b.value.toFixed(2)}`,
        data: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json(atividades);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar atividades',
      details: error.message,
    });
  }
};
