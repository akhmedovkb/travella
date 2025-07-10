// routes/authRoutes.js
import express from 'express';
import { registerProvider } from '../controllers/authController.js';

const router = express.Router();

// POST /api/providers/register
router.post('/providers/register', registerProvider);

export default router;
