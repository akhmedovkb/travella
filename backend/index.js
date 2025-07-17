const express = require('express');
const app = express();
const providerRoutes = require('./routes/providerRoutes');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api/providers', providerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
