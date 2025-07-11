const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const clientAuth = require('../middleware/clientAuth');

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация клиента
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const existing = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Клиент с таким email уже существует' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO clients (name, email, phone, password) VALUES ($1, $2, $3, $4)',
      [name, email, phone, hashed]
    );

    res.status(201).json({ message: 'Клиент успешно зарегистрирован' });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход клиента
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (client.rows.length === 0) {
      return res.status(400).json({ error: 'Неверные email или пароль' });
    }

    const valid = await bcrypt.compare(password, client.rows[0].password);
    if (!valid) {
      return res.status(400).json({ error: 'Неверные email или пароль' });
    }

    const token = jwt.sign({ id: client.rows[0].id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение данных клиента
router.get('/me', clientAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [req.client.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
