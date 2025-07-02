const express = require('express');
const router = express.Router();

const notificationsController = require('../controllers/notifications.controller');
const auth = require('../middlewares/auth.middleware');

// 🔔 Rota protegida para buscar notificações do usuário logado
router.get('/', auth, notificationsController.getNotifications);

module.exports = router;
