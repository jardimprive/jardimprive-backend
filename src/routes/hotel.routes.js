const express = require('express');
const router = express.Router();

const hotelController = require('../controllers/hotel.controller');
const auth = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// ✅ Agendar diária (vendedora)
router.post('/agendar', auth, hotelController.agendarDiaria);

// ✅ Ver minha diária (vendedora)
router.get('/minha-diaria', auth, hotelController.verMinhaDiaria);

// ✅ Ver todas as reservas (admin)
router.get('/admin/todas', auth, isAdmin, hotelController.verTodasAsReservas);

// ✅ Verifica se vendedora já pode agendar hotel
router.get('/meta', auth, hotelController.checarMetaHotel); // ✅ MOVIDA PARA CIMA

module.exports = router;
