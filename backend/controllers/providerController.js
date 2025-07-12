// controllers/providerController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Генерация токена
const generateToken = (id) => {
  return jwt.sign({ id, role: 'provider' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Регистрация
exports.registerProvider = async (req, res) => {
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
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO providers 
      (type, name, contact_name, email, phone, password, description, location, languages, created_at, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
      RETURNING id`,
      [type, name, contact_name, email, phone, password, description, location, languages, images]
    );

    const token = generateToken(result.rows[0].id);
    res.status(201).json({ message: 'Регистрация прошла успешно', token });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Логин
exports.loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const provider = result.rows[0];
    const token = generateToken(provider.id);
    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
};

// Получить профиль
exports.getProviderProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить профиль
exports.updateProviderProfile = async (req, res) => {
  const { email, password, images } = req.body;

  try {
    await pool.query(
      'UPDATE providers SET email = $1, password = $2, images = $3 WHERE id = $4',
      [email, password, images, req.user.id]
    );

    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('Ошибка обновления:', err);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

// Получить все услуги
exports.getProviderServices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE provider_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить услугу
exports.addProviderService = async (req, res) => {
  const { title, description, price, category, images } = req.body;
  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Пожалуйста, заполните обязательные поля' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, images, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [req.user.id, title, description, price, category, images]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить услугу
exports.updateProviderService = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, images } = req.body;

  try {
    await pool.query(
      `UPDATE services 
       SET title=$1, description=$2, price=$3, category=$4, images=$5
       WHERE id=$6 AND provider_id=$7`,
      [title, description, price, category, images, id, req.user.id]
    );

    res.json({ message: 'Услуга обновлена' });
  } catch (err) {
    console.error('Ошибка при обновлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить услугу
exports.deleteProviderService = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error('Ошибка при удалении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
