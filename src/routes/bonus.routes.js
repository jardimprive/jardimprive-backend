const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonus.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Adicionado

// 🟢 Vendedora
router.get('/me', auth, bonusController.getMyBonuses);
router.get('/progress', auth, bonusController.getProgress);

// 🔴 Admin: ver todos os bônus
router.get('/admin/all', auth, isAdmin, bonusController.getAllBonusesAdmin); // ✅ Nova rota

module.exports = router;
