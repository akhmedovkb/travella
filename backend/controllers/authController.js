import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: provider.id, email: provider.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Успешный вход', token });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
