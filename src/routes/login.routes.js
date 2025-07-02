const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const loginController = require('../controllers/login.controller');

router.get('/me', auth, loginController.getMyLogins);

module.exports = router;
