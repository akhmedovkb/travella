import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Регистрация поставщика
export const registerProvider = async (req, res) => {
  try {
    const {
      type,
      name,
      location,
      contact_name,
      email,
      phone,
      password,
      description,
      languages,
      images
    } = req.body;

    // Проверка на существующего пользователя
    const existing = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка в базу
    await pool.query(
      `INSERT INTO providers 
       (type, name, location, contact_name, email, phone, password, description, languages, images, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())`,
      [
        type,
        name,
        location,
        contact_name,
        email,
        phone,
        hashedPassword,
        description,
        languages,
        images || null
      ]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

// Вход поставщика
export const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ message: 'Успешный вход', token, provider: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
};
