const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 📥 Rota de login
router.post('/login', authController.login);

// 🆕 Rota de cadastro
router.post('/register', authController.register);

module.exports = router;
