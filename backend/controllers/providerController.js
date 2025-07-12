const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO providers 
       (type, name, contact_name, email, phone, password, description, location, languages, created_at, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
       RETURNING *`,
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

    res.status(201).json({ message: 'Поставщик зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const provider = result.rows[0];
    const isMatch = await bcrypt.compare(password, provider.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: provider.id, role: 'provider' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getProviderProfile = async (req, res) => {
  try {
    const providerId = req.user.id;

    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const updateProviderProfile = async (req, res) => {
  const { email, password, images } = req.body;
  const providerId = req.user.id;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `UPDATE providers 
       SET email = $1, 
           password = COALESCE($2, password), 
           images = $3
       WHERE id = $4
       RETURNING *`,
      [email, hashedPassword, images, providerId]
    );

    res.json({ message: 'Профиль обновлён', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
};
