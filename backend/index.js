const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Импортируем роуты
const providerRoutes = require('./routes/providerRoutes');

// Middleware
app.use(cors({
  origin: ['https://frontend-komil.vercel.app', 'https://frontend-six-ivory-24.vercel.app'], // 👈 для CORS
  credentials: true
}));
app.use(express.json());

// Роуты
app.use('/api/providers', providerRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
