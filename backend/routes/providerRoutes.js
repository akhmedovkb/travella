const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
} = require('../controllers/providerController');

const verifyToken = require('../middleware/providerAuth');

// Регистрация
router.post('/register', registerProvider);

// Вход
router.post('/login', loginProvider);

// Получить профиль
router.get('/profile', verifyToken, getProviderProfile);

// Обновить профиль
router.put('/profile', verifyToken, updateProviderProfile);

module.exports = router;
