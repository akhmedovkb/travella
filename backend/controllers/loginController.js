// 📁 controllers/loginController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { id: provider.id, email: provider.email, type: provider.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Вход успешен', token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};


// 📁 routes/authRoutes.js
import express from 'express';
import { registerProvider } from '../controllers/authController.js';
import { loginProvider } from '../controllers/loginController.js';

const router = express.Router();

router.post('/providers/register', registerProvider);
router.post('/providers/login', loginProvider);

export default router;


// 📁 .env (убедись, что он есть в Railway или локально)
// ... остальные переменные
JWT_SECRET=your_super_secret_key
