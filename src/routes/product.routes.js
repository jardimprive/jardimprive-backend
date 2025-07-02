const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ Importa o middleware

// 🔐 Rotas protegidas
router.post('/', auth, isAdmin, productController.createProduct); // ✅ Somente admin
router.get('/', auth, productController.getAllProducts);          // ✅ Vendedoras e admins
router.get('/:id', auth, productController.getProductById);       // ✅ Vendedoras e admins
router.put('/:id', auth, isAdmin, productController.updateProduct); // ✅ Somente admin
router.delete('/:id', auth, isAdmin, productController.deleteProduct); // ✅ Somente admin

module.exports = router;
