import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import clientAuth from '../middleware/clientAuth.js';

const router = express.Router();
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

// Получение информации о текущем клиенте
router.get('/me', clientAuth, async (req, res) => {
  try {
    const clientId = req.client.id;
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении профиля клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
