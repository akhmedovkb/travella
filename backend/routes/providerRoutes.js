// backend/routes/providerRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const providerAuth = require('../middleware/providerAuth');

// Получить все услуги поставщика
router.get('/services', providerAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE provider_id = $1',
      [req.provider.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить новую услугу
router.post('/services', providerAuth, async (req, res) => {
  const { title, description, price, category, images } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, images, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [req.provider.id, title, description, price, category, images]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка добавления услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера при добавлении' });
  }
});

// Обновить услугу
router.put('/services/:id', providerAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, images } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services
       SET title = $1, description = $2, price = $3, category = $4, images = $5
       WHERE id = $6 AND provider_id = $7
       RETURNING *`,
      [title, description, price, category, images, id, req.provider.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка обновления услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении' });
  }
});

// Удалить услугу
router.delete('/services/:id', providerAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.provider.id]
    );
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error('Ошибка удаления услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении' });
  }
});

module.exports = router;
