const express = require('express');
const router = express.Router();
const metaController = require('../controllers/meta.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/my-progress', auth, metaController.getMyGoalProgress);

module.exports = router;
