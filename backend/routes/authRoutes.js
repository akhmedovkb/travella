// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Регистрация поставщика
router.post('/providers/register', async (req, res) => {
  const {
    type,
    name,
    location,
    contactPerson,
    email,
    phone,
    languages,
    password,
    description,
    images
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO providers 
        (type, name, location, contact_name, email, phone, languages, password, description, images, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id
    `;
    const values = [
      type,
      name,
      location,
      contactPerson,
      email,
      phone,
      JSON.stringify(languages), // сохраняем как JSON-строку
      hashedPassword,
      description,
      images // ожидается массив base64 или JSON-строка
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Поставщик зарегистрирован', id: result.rows[0].id });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Логин поставщика
router.post('/providers/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Успешный вход', token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

export default router;
