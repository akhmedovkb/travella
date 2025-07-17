const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  getProviderServices,
  addService,
  updateService,
  deleteService,
} = require('../controllers/providerController');

const verifyToken = require('../middleware/providerAuth');

// Регистрация и логин
router.post('/register', registerProvider);
router.post('/login', loginProvider);

// Профиль поставщика
router.get('/profile', verifyToken, getProviderProfile);
router.put('/profile', verifyToken, updateProviderProfile);

// Услуги поставщика
router.get('/services', verifyToken, getProviderServices);
router.post('/services', verifyToken, addService);
router.put('/services/:id', verifyToken, updateService);
router.delete('/services/:id', verifyToken, deleteService);

module.exports = router;
