import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация провайдера
router.post('/register', async (req, res) => {
  const { company, service_type, email, password, phone, description, images } = req.body;

  if (!company || !service_type || !email || !password || !phone || !description) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const existing = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Провайдер с таким email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO providers (company, service_type, email, password, phone, description, images) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [company, service_type, email, hashedPassword, phone, description, images || null]
    );

    res.status(201).json({ message: 'Провайдер зарегистрирован' });
  } catch (err) {
    console.error('Ошибка при регистрации провайдера:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Логин провайдера
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const provider = result.rows[0];
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: provider.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, provider });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
