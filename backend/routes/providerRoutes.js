const express = require('express');
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  getProviderServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/providerController');
const verifyToken = require('../middleware/providerAuth');

router.post('/register', registerProvider);
router.post('/login', loginProvider);
router.get('/profile', verifyToken, getProviderProfile);
router.put('/profile', verifyToken, updateProviderProfile);

router.get('/services', verifyToken, getProviderServices);
router.post('/services', verifyToken, createService);
router.put('/services/:id', verifyToken, updateService);
router.delete('/services/:id', verifyToken, deleteService);

module.exports = router;
