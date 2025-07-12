const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const providerRoutes = require('./routes/providerRoutes');
const clientRoutes = require('./routes/clientRoutes');

dotenv.config();
const app = express();

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());

// Роуты
app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Travella API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
