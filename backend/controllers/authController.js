// 📁 server/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const registerProvider = async (req, res) => {
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
    await pool.query(
      `INSERT INTO providers (type, name, location, contact_name, email, phone, languages, password, description, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [type, name, location, contactPerson, email, phone, languages.join(','), hashedPassword, description, images]
    );

    res.status(201).json({ message: 'Поставщик зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Успешный вход', token, user });
  } catch (err) {
    console.error('Ошибка при логине:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
