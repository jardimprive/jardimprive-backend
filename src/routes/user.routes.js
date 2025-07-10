const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Importado para proteger rota de admin

// 🔓 Rotas abertas (sem login)
router.post('/register', userController.register);
router.post('/login', userController.login);

// 🔐 Rotas protegidas (precisa estar logado)
router.get('/profile', auth, userController.getProfile);

// 🔧 🔒 Atualizar dados do perfil (nome, cpf, telefone, endereço, foto)
router.put('/profile', auth, userController.updateProfile);

// 🔑 🔒 Alterar senha
router.put('/profile/password', auth, userController.changePassword);

// 🔍 🔒 Histórico de login
router.get('/profile/history', auth, userController.getLoginHistory);

// 🔒👑 ADMIN: Listar todas as vendedoras
router.get('/admin/all', auth, isAdmin, userController.getAllVendedoras);

// 🔒👑 ADMIN: Atualizar status (ativa/inativa) da vendedora
router.patch('/admin/sellers/:id/status', auth, isAdmin, userController.updateVendedoraStatus);

// 🔒👑 ADMIN: Ativar vendedora como Líder de Equipe
router.patch('/admin/ativar-lider/:id', auth, isAdmin, userController.adminAtivarLiderEquipe);

module.exports = router;
