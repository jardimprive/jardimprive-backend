module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next(); // ✅ Ele é admin, pode passar
  }

  // ❌ Se não for admin, bloqueia
  return res.status(403).json({ error: 'Acesso restrito a administradores.' });
};
