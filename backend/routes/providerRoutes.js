const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const providerAuth = require('../middleware/providerAuth');

const JWT_SECRET = process.env.JWT_SECRET;

// 🔹 Регистрация поставщика
router.post('/register', async (req, res) => {
  const { name, email, phone, password, image } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const existingProvider = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existingProvider.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO providers (name, email, phone, password, image) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone, hashedPassword, image || null]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🔹 Логин поставщика
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const provider = await db.query('SELECT * FROM providers WHERE email = $1', [email]);

    if (provider.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, provider.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: provider.rows[0].id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🔹 Получение профиля поставщика (защищённый маршрут)
router.get('/profile', providerAuth, async (req, res) => {
  try {
    const providerId = req.provider.id;
    const result = await db.query(
      'SELECT id, name, email, phone, image FROM providers WHERE id = $1',
      [providerId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
