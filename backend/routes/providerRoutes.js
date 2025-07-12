// routes/providerRoutes.js
const express = require('express');
const router = express.Router();
const providerAuth = require('../middleware/providerAuth');
const pool = require('../db');

// Обновление услуги
router.put('/services/:id', providerAuth, async (req, res) => {
  const serviceId = req.params.id;
  const providerId = req.user.id;
  const { title, description, price, category, images } = req.body;

  try {
    const check = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND provider_id = $2',
      [serviceId, providerId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    const result = await pool.query(
      `UPDATE services
       SET title = $1, description = $2, price = $3, category = $4, images = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, price, category, images, serviceId]
    );

    res.json({ message: 'Услуга обновлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление услуги
router.delete('/services/:id', providerAuth, async (req, res) => {
  const serviceId = req.params.id;
  const providerId = req.user.id;

  try {
    const check = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND provider_id = $2',
      [serviceId, providerId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error('Ошибка при удалении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
