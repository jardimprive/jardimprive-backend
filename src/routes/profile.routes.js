const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const auth = require('../middlewares/auth.middleware');

// 🔒 Buscar dados do usuário logado
router.get('/me', auth, profileController.getProfile);

// ✏️ Atualizar nome, CPF, foto
router.put('/me', auth, profileController.updateProfile);

// 🔑 Alterar senha
router.put('/password', auth, profileController.updatePassword);

// 🧩 Novo: Histórico completo de atividades
router.get('/atividades', auth, profileController.getAtividades);

module.exports = router;
