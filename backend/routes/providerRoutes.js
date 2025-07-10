// server/routes/providerRoutes.js
import express from 'express';
import { registerProvider } from '../controllers/providerController.js';

const router = express.Router();

router.post('/providers/register', registerProvider);

export default router;
