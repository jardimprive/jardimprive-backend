const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const leaderController = require('../controllers/leader.controller');

// 🔒 Painel da Líder de Equipe
router.get('/dashboard', auth, leaderController.getDashboard);

module.exports = router;
