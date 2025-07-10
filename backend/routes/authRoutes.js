// routes/authRoutes.js
import express from 'express';
import { registerProvider, loginProvider } from '../controllers/authController.js';

const router = express.Router();

// Регистрация поставщика
router.post('/providers/register', registerProvider);

// Логин поставщика
router.post('/providers/login', loginProvider);

export default router;
