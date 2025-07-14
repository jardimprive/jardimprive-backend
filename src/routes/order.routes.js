const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// 🔐 Vendedora: criar pedido (usado para parcelado no sistema)
router.post('/', auth, orderController.createOrder);

// 🔐 Vendedora: criar pedido com entrada via Mercado Pago (PIX ou Cartão)
router.post('/entrada', auth, orderController.createOrderEntrada);

// 🔐 Vendedora: gerar link de pagamento Mercado Pago (cartão)
router.post('/checkout', auth, orderController.createOrderWithCheckout);

// 🔐 Vendedora: gerar link de pagamento via PIX
router.post('/pix', auth, orderController.createOrderPix);

// ✅ 🔐 Vendedora: gerar link de pagamento da parcela final
router.post('/parcela-final', auth, orderController.createOrderFinal);

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

module.exports = router;
