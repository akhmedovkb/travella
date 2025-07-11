const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const providerAuth = require('../middleware/providerAuth');

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация поставщика
router.post('/register', async (req, res) => {
  const { name, email, phone, password, company_name, service_type } = req.body;

  if (!name || !email || !phone || !password || !company_name || !service_type) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const existing = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO providers (name, email, phone, password, company_name, service_type) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, phone, hashedPassword, company_name, service_type]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация поставщика
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM providers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const provider = result.rows[0];
    const validPassword = await bcrypt.compare(password, provider.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ providerId: provider.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение профиля поставщика (защищённый маршрут)
router.get('/profile', providerAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone, company_name, service_type, images FROM providers WHERE id = $1', [req.providerId]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
