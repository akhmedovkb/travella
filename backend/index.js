import express from 'express';
import cors from 'cors';
import providerRoutes from './routes/providerRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import clientAuthRoutes from './routes/clientAuthRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/clients', clientAuthRoutes); // добавлен login

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
