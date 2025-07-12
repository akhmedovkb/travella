// routes/providerRoutes.js
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authenticateProvider = require('../middleware/providerAuth');

// Аутентификация
router.post('/register', providerController.registerProvider);
router.post('/login', providerController.loginProvider);

// Профиль
router.get('/profile', authenticateProvider, providerController.getProviderProfile);
router.put('/profile', authenticateProvider, providerController.updateProviderProfile);

// CRUD услуг
router.get('/services', authenticateProvider, providerController.getProviderServices);
router.post('/services', authenticateProvider, providerController.addProviderService);
router.put('/services/:id', authenticateProvider, providerController.updateProviderService);
router.delete('/services/:id', authenticateProvider, providerController.deleteProviderService);

module.exports = router;
