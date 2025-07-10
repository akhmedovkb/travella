// routes/authRoutes.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/providers/register', async (req, res) => {
  try {
    const {
      type,
      name,
      contact_name,
      email,
      phone,
      password,
      description,
      location,
      languages, // массив языков
      images     // пока можно не сохранять
    } = req.body;

    const result = await pool.query(
      `INSERT INTO providers 
       (type, name, contact_name, email, phone, password, description, location, languages, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        type,
        name,
        contact_name,
        email,
        phone,
        password,
        description,
        location,
        languages.join(', ') // сохраняем как строку
      ]
    );

    res.status(201).json({ message: '✅ Успешно зарегистрировано', provider: result.rows[0] });
  } catch (err) {
    console.error('❌ Ошибка при регистрации поставщика:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

import express from 'express';
import { registerProvider, loginProvider } from '../controllers/authController.js';

const router = express.Router();

router.post('/providers/register', registerProvider);
router.post('/providers/login', loginProvider);

export default router;

