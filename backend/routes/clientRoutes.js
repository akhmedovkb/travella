const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const clientAuth = require('../middleware/clientAuth');

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    const existing = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO clients (name, email, phone, password) VALUES ($1, $2, $3, $4)',
      [name, email, phone, hashed]
    );

    res.status(201).json({ message: 'Клиент зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации клиента:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    const client = result.rows[0];

    if (!client || !(await bcrypt.compare(password, client.password))) {
      return res.status(401).json({ error: 'Неверные данные' });
    }

    const token = jwt.sign({ clientId: client.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка логина клиента:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Профиль
router.get('/me', clientAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [req.clientId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка профиля клиента:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
