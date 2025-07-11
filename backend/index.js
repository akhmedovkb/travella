const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const providerRoutes = require('./routes/providerRoutes');
const clientRoutes = require('./routes/clientRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
