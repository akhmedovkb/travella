// backend/routes/providerRoutes.js
const express = require('express');
const router = express.Router();
const { registerProvider } = require('../controllers/providerController');
const { loginProvider } = require('../controllers/loginController');
const { getProviderProfile, updateProviderProfile } = require('../controllers/authController');
const providerAuth = require('../middleware/providerAuth');

// Регистрация
router.post('/register', registerProvider);

// Вход
router.post('/login', loginProvider);

// Профиль
router.get('/profile', providerAuth, getProviderProfile);
router.put('/profile', providerAuth, updateProviderProfile);

module.exports = router;
