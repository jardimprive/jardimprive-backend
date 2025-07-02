const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // 1️⃣ Pega o token do cabeçalho Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2️⃣ Se não tiver token, bloqueia
  if (!token) return res.status(401).json({ error: 'Token não encontrado' });

  // 3️⃣ Verifica e decodifica o token usando o segredo do .env
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    // 4️⃣ Armazena os dados do usuário no req.user para uso nas rotas protegidas
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };

    next(); // tudo certo, pode continuar
  });
}

module.exports = auth;
