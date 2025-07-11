const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const providerRoutes = require('./routes/providerRoutes');
const clientRoutes = require('./routes/clientRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
  res.send('Travella API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
