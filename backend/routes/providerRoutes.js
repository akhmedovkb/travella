// src/routes/providerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// POST /api/providers/register
router.post('/register', async (req, res) => {
  const {
    type,
    name,
    location,
    contactPerson,
    email,
    phone,
    languages,
    password,
    description
  } = req.body;

  try {
    // Проверка на существующий email
    const existing = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO providers 
        (type, name, location, contact_person, email, phone, languages, password, description) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [type, name, location, contactPerson, email, phone, languages, hashedPassword, description]
    );

    res.status(201).json({ message: 'Регистрация успешна', providerId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

module.exports = router;
