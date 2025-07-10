const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Разрешаем запросы с Vercel-домена
app.use(cors({
  origin: 'https://frontend-f40xy1ldq-komil.vercel.app'
}));

app.use(express.json());

// твои роуты
app.use('/api', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
