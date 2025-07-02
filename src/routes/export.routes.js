const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// ✅ Apenas admin pode exportar
router.get('/:type', auth, isAdmin, exportController.exportCSV);

module.exports = router;
