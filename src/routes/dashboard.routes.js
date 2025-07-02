const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Proteção para admin

// 🔥 Vendedora: Dashboard individual
router.get('/summary', auth, dashboardController.getDashboardSummary);

// 🧩 Histórico unificado (pedidos + saques + bônus + comissões)
router.get('/atividade', auth, dashboardController.getUserActivity);

// 🔍 Detalhes de uma atividade específica (tipo e id)
router.get('/atividade/:id', auth, dashboardController.getAtividadeDetalhada); // ✅ NOVA ROTA

// 🔴 ADMIN: Dashboard geral com totais
router.get('/admin', auth, isAdmin, dashboardController.getAdminDashboard);

module.exports = router;
