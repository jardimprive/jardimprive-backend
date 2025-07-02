const express = require('express');
const router = express.Router();
const mpController = require('../controllers/mercadopago.controller');

router.post('/webhook', mpController.webhook);

module.exports = router;
