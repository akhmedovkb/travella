import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://frontend-komil.vercel.app', 'https://frontend-six-ivory-24.vercel.app']
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api', authRoutes);

app.get('/', (_, res) => res.send('Travella backend is running.'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
