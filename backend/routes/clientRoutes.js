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
    const existingClient = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existingClient.rows.length > 0) {
      return res.status(400).json({ error: 'Клиент с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO clients (name, email, phone, password) VALUES ($1, $2, $3, $4)',
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({ message: 'Клиент успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение данных клиента
router.get('/me', clientAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [req.client.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление данных клиента
router.put('/me', clientAuth, async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE clients SET name = $1, phone = $2, password = $3 WHERE id = $4',
        [name, phone, hashedPassword, req.client.id]
      );
    } else {
      await db.query(
        'UPDATE clients SET name = $1, phone = $2 WHERE id = $3',
        [name, phone, req.client.id]
      );
    }

    res.json({ message: 'Данные успешно обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
