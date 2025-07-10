import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import pool, { initDB } from './db.js'; // <–– Добавили initDB сюда

dotenv.config();
const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.json());
app.use('/api', authRoutes);

// 🧠 Инициализация БД перед запуском сервера
initDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((err) => {
  console.error('❌ Ошибка подключения к БД:', err);
});
