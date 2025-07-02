const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware'); // ✅ adicionando middleware

// 🔐 Vendedora: criar pedido
router.post('/', auth, orderController.createOrder);

// 🔴 Admin: ver todos os pedidos
router.get('/', auth, isAdmin, orderController.getAllOrders);

// 🔐 Admin: ver todos os pedidos do sistema
router.get('/admin/all', auth, isAdmin, orderController.getAllOrdersAdmin);

// 🔐 Vendedora: ver pedido por ID
router.get('/:id', auth, orderController.getOrderById);

// 🔴 Admin: atualizar status do pedido
router.put('/:id', auth, isAdmin, orderController.updateOrderStatus);

// 🔴 Admin: deletar pedido
router.delete('/:id', auth, isAdmin, orderController.deleteOrder);

// 🔐 Vendedora: gerar link de pagamento Mercado Pago
router.post('/checkout', auth, orderController.createOrderWithCheckout);

module.exports = router;
