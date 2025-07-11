// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const providerRoutes = require('./routes/providerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Подключаем маршруты
app.use('/api/providers', providerRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
