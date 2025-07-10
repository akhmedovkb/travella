import express from 'express';
import { registerProvider, loginProvider } from '../controllers/authController.js';

const router = express.Router();

router.post('/providers/register', registerProvider);
router.post('/providers/login', loginProvider);

export default router;
