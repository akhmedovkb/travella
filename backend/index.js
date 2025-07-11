import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

import providerRoutes from './routes/providerRoutes.js';
import clientRoutes from './routes/clientRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
