const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commission.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Importa o middleware de admin

// 🟢 Vendedora
router.get('/me', auth, commissionController.getMyCommissions);

// 🔴 Admin
router.get('/', auth, isAdmin, commissionController.getAllCommissions);

// 🔴 Admin → Atualizar status da comissão (ex: PENDENTE → PAGA)
router.patch('/:id', auth, isAdmin, commissionController.updateCommissionStatus);

module.exports = router;
