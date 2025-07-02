const express = require('express');
const router = express.Router();
const variationController = require('../controllers/variation.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// ✅ Somente admin pode editar variações
router.put('/:id', auth, isAdmin, variationController.updateVariation);

module.exports = router;
