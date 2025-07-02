const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 🔐 Função de login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o e-mail e senha foram enviados
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  try {
    // Procura o usuário no banco
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Cria o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🔥 Registra histórico de login
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip || req.headers['x-forwarded-for'] || 'Desconhecido',
        userAgent: req.headers['user-agent'] || '',
      },
    });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login.', details: error.message });
  }
};
