const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  addService,
  getServices,
  updateService,
  deleteService
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

// Услуги
router.post('/services', verifyToken, addService);
router.get('/services', verifyToken, getServices);
router.put('/services/:serviceId', verifyToken, updateService);
router.delete('/services/:serviceId', verifyToken, deleteService);

module.exports = router;
