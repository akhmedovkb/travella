const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const providerRoutes = require('./routes/providerRoutes');
const clientRoutes = require('./routes/clientRoutes');

dotenv.config();
const app = express();

// CORS настройка с методами и заголовками
const allowedOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 👈 обязательно для OPTIONS-запросов

app.use(express.json());

// Роуты
app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
  res.send('Travella API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
