const express = require('express');
const router = express.Router();
const pool = require('../db');
const providerAuth = require('../middleware/providerAuth');

// Получение всех услуг поставщика
router.get('/services', providerAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE provider_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание новой услуги
router.post('/services', providerAuth, async (req, res) => {
  const { title, description, price, category, images, availability } = req.body;

  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, images, availability)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description, price, category, images || [], availability || []]
    );
    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка создания услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление услуги
router.put('/services/:id', providerAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, images, availability } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services
       SET title = $1, description = $2, price = $3, category = $4, images = $5, availability = $6
       WHERE id = $7 AND provider_id = $8 RETURNING *`,
      [title, description, price, category, images || [], availability || [], id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    res.json({ message: 'Услуга обновлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление услуги
router.delete('/services/:id', providerAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error('Ошибка удаления услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
