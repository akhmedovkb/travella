const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ✅ Регистрация поставщика
exports.register = async (req, res) => {
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
    images
  } = req.body;

  if (!type || !name || !contact_name || !email || !phone || !password || !location) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
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
        images
      ]
    );

    res.status(201).json({ message: 'Поставщик зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при регистрации поставщика:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

// ✅ Вход поставщика
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: provider.id, role: 'provider' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    console.error('Ошибка при входе поставщика:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// ✅ Получить профиль поставщика
exports.getProfile = async (req, res) => {
  const providerId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// ✅ Обновить профиль поставщика
exports.updateProfile = async (req, res) => {
  const providerId = req.user.id;
  const { email, password, images } = req.body;

  try {
    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `UPDATE providers SET 
        email = COALESCE($1, email),
        password = COALESCE($2, password),
        images = COALESCE($3, images)
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
