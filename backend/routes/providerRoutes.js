const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация
router.post('/register', async (req, res) => {
  const { name, email, password, description, phone, type, images } = req.body;

  if (!name || !email || !password || !phone || !type) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  try {
    const existing = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email уже используется' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO providers (name, email, password, description, phone, type, images) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, email, hashed, description, phone, type, images]
    );

    res.status(201).json({ message: 'Поставщик зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверные данные' });
    }

    const token = jwt.sign({ providerId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка логина:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение профиля
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, description, phone, type, images FROM providers WHERE id = $1', [req.providerId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
