import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import providerRoutes from './routes/providerRoutes.js';
import clientRoutes from './routes/clientRoutes.js';

dotenv.config();

const app = express();

// ✅ Разрешаем CORS для frontend-домена
const allowedOrigins = ['https://frontend-komil.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
