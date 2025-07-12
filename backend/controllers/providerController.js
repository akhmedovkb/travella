const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Регистрация
const registerProvider = async (req, res) => {
  const {
    type,
    name,
    contact_name,
    email,
    phone,
    password,
    description,
    location,
    languages,
    images,
  } = req.body;

  if (!type || !name || !contact_name || !email || !phone || !password || !location) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const existing = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO providers 
      (type, name, contact_name, email, phone, password, description, location, languages, images, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`,
      [
        type,
        name,
        contact_name,
        email,
        phone,
        hashedPassword,
        description,
        location,
        languages,
        images,
      ]
    );

    res.status(201).json({ message: 'Регистрация прошла успешно', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

// Вход
const loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id, role: 'provider' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
};

// Получение профиля
const getProviderProfile = async (req, res) => {
  const providerId = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    const provider = result.rows[0];
    res.json(provider);
  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление профиля
const updateProviderProfile = async (req, res) => {
  const providerId = req.user.id;
  const { email, password, images } = req.body;

  try {
    const updates = [];
    const values = [];
    let i = 1;

    if (email) {
      updates.push(`email = $${i++}`);
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push(`password = $${i++}`);
      values.push(hashed);
    }
    if (images && images.length > 0) {
      updates.push(`images = $${i++}`);
      values.push(images);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    values.push(providerId);

    const query = `UPDATE providers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({ message: 'Профиль обновлен', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
};
