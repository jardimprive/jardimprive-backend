const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// ✅ Rota para listar todas as vendedoras
router.get('/vendedoras', auth, isAdmin, adminController.getAllVendedoras);

// 🔍 Buscar uma vendedora por ID
router.get('/vendedoras/:id', auth, isAdmin, adminController.getVendedoraById);

module.exports = router;
