const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация поставщика
router.post('/register', async (req, res) => {
  const {
    type, name, location, contactPerson,
    email, phone, languages, password, description, images
  } = req.body;

  console.log('Полученные данные от формы:', req.body); // 👈 Добавлено

  if (!type || !name || !location || !contactPerson || !email || !phone || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const existingProvider = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existingProvider.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO providers (type, name, location, contact_person, email, phone, languages, password, description, images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [
        type,
        name,
        location,
        contactPerson,
        email,
        phone,
        JSON.stringify(languages),
        hashedPassword,
        description,
        JSON.stringify(images)
      ]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
