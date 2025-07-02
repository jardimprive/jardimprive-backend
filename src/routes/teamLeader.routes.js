const express = require('express');
const router = express.Router();
const teamLeaderController = require('../controllers/teamLeader.controller');
const auth = require('../middlewares/auth.middleware');

// Todas as rotas abaixo exigem que o usuário esteja autenticado (vendedora líder)

router.get('/dashboard', auth, teamLeaderController.getLiderDashboard);

router.get('/comissoes', auth, teamLeaderController.getComissoesEquipe);

router.get('/saldo', auth, teamLeaderController.getSaldoLider);

module.exports = router;
