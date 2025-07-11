const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const clientRoutes = require('./routes/clientRoutes');
const providerRoutes = require('./routes/providerRoutes'); // если уже есть

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/providers', providerRoutes); // если есть

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
