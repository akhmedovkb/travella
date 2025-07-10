// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import providerRoutes from './routes/providerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://frontend-komil.vercel.app', 'https://frontend-six-ivory-24.vercel.app'],
}));
app.use(express.json());

app.use('/api', providerRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
