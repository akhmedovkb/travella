const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  createService,
  getAllServices
} = require('../controllers/providerController');

const verifyToken = require('../middleware/providerAuth');

// Регистрация
router.post('/register', registerProvider);

// Вход
router.post('/login', loginProvider);

// Профиль
router.get('/profile', verifyToken, getProviderProfile);
router.put('/profile', verifyToken, updateProviderProfile);

// Услуги
router.post('/services', verifyToken, createService);
router.get('/services', verifyToken, getAllServices); // <== ДОБАВЛЕНО

module.exports = router;
