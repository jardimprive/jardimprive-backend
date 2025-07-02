const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // ✅ Para gerar código único

// ✅ Registro de novo usuário
exports.register = async (req, res) => {
  const { name, email, password, cpf, phone, address, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        phone,
        address,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Senha incorreta' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // 🔥 Registrar no histórico de login
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ip: req.ip || req.connection.remoteAddress || 'Desconhecido',
      userAgent: req.headers['user-agent'] || 'Desconhecido',
    },
  });

  res.json({ message: 'Login realizado com sucesso', token });
};

// ✅ Obter perfil
exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      phone: true,
      address: true,
      role: true,
      status: true,
      photo: true,
      isTeamLeader: true,
      teamCode: true,
    },
  });

  res.json(user);
};

// ✅ Atualizar perfil (nome, cpf, endereço, telefone, foto)
exports.updateProfile = async (req, res) => {
  const { name, cpf, phone, address, photo } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        cpf,
        phone,
        address,
        photo,
      },
    });

    res.json({ message: 'Perfil atualizado com sucesso!', user });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar perfil', details: error.message });
  }
};

// ✅ Alterar senha
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ error: 'Senha atual incorreta' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password: hashedPassword,
    },
  });

  res.json({ message: 'Senha alterada com sucesso!' });
};

// ✅ 🔥 Obter histórico de login
exports.getLoginHistory = async (req, res) => {
  const history = await prisma.loginHistory.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(history);
};

// ✅ 🔒 ADMIN: Listar todas as vendedoras
exports.getAllVendedoras = async (req, res) => {
  try {
    const vendedoras = await prisma.user.findMany({
      where: {
        role: 'VENDEDORA',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        isBlocked: true,
        createdAt: true,
        isTeamLeader: true,
        teamCode: true,
      },
    });

    res.json(vendedoras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vendedoras', details: error.message });
  }
};

// ✅ 🔒 ADMIN: Atualizar status da vendedora (ativa/inativa)
exports.updateVendedoraStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ATIVA', 'INATIVA'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido. Use ATIVA ou INATIVA.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Status atualizado com sucesso!', user });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar status', details: error.message });
  }
};

// ✅ 🔒 ADMIN: Ativar vendedora como líder de equipe
exports.adminAtivarLiderEquipe = async (req, res) => {
  const { id } = req.params;

  try {
    const code = `TL-${uuidv4().slice(0, 8)}`;

    const user = await prisma.user.update({
      where: { id },
      data: {
        isTeamLeader: true,
        teamCode: code,
      },
    });

    res.json({
      message: 'Vendedora ativada como líder de equipe!',
      user,
    });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao ativar líder de equipe', details: error.message });
  }
};
