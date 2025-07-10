import express from 'express';
import { registerProvider } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerProvider);

export default router;
