const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawal.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Adicionado

// 🟢 Vendedora
router.post('/', auth, withdrawalController.requestWithdrawal);
router.get('/me', auth, withdrawalController.getMyWithdrawals);

// 🔴 Admin (protegidas com isAdmin)
router.get('/admin', auth, isAdmin, withdrawalController.getAllWithdrawals);
router.patch('/:id', auth, isAdmin, withdrawalController.updateWithdrawalStatus);

module.exports = router;
