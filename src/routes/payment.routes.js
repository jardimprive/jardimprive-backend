const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');
// const isAdmin = require('../middlewares/isAdmin.middleware'); // 🔓 Ative se for usar rotas exclusivas do admin

// 🔐 Vendedora - Ver seus próprios pagamentos
router.get('/', auth, paymentController.getMyPayments);

// 🔐 Vendedora - Realizar pagamento manual (caso necessário)
router.post('/pay/:id', auth, paymentController.payPayment);

// 🔐 Vendedora - Gerar link de pagamento via Mercado Pago
router.post('/checkout', auth, paymentController.createCheckout);

// 🔴 Admin - Exemplo de rota futura (listar todos os pagamentos)
// router.get('/admin', auth, isAdmin, paymentController.getAllPayments);

module.exports = router;
