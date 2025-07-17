const express = require('express');
const router = express.Router();
const { loginProvider } = require('../controllers/providerController');

router.post('/login', loginProvider);

module.exports = router;
