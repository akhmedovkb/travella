const express = require('express');
const router = express.Router();
const { loginProvider, getProviderProfile } = require('../controllers/providerController');
const verifyToken = require('../middleware/verifyToken');

router.post('/login', loginProvider);
router.get('/profile', verifyToken, getProviderProfile);

module.exports = router;
