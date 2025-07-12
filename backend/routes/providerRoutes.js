const express = require('express');
const router = express.Router();
const pool = require('../db');
const providerAuth = require('../middleware/providerAuth');

// Получить все услуги текущего поставщика
router.get('/services', providerAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE provider_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить новую услугу
router.post('/services', providerAuth, async (req, res) => {
  const { title, description, price, category, availability } = req.body;

  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, availability)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, description, price, category, availability || []]
    );

    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при добавлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
