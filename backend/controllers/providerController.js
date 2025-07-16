const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Регистрация
const registerProvider = async (req, res) => {
  const {
    name,
    email,
    password,
    type,
    location,
    contact_name,
    phone,
    description,
    languages,
    images,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO providers 
      (name, email, password, type, location, contact_name, phone, description, languages, images) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        name,
        email,
        hashedPassword,
        type,
        location,
        contact_name,
        phone,
        description,
        languages,
        images,
      ]
    );

    res.status(201).json({ message: 'Поставщик зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Логин
const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

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

// Получить профиль
const getProviderProfile = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM providers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить профиль
const updateProviderProfile = async (req, res) => {
  const {
    name,
    email,
    password,
    type,
    location,
    contact_name,
    phone,
    description,
    languages,
    images,
  } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await db.query(
      `UPDATE providers SET 
        name=$1, 
        email=$2, 
        ${hashedPassword ? 'password=$3,' : ''} 
        type=$4, 
        location=$5, 
        contact_name=$6, 
        phone=$7, 
        description=$8, 
        languages=$9, 
        images=$10 
      WHERE id=$11 RETURNING *`,
      [
        name,
        email,
        ...(hashedPassword ? [hashedPassword] : []),
        type,
        location,
        contact_name,
        phone,
        description,
        languages,
        images,
        req.user.id,
      ]
    );

    res.json({ message: 'Профиль обновлён', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать услугу
const createService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  const providerId = req.user.id;

  try {
    const result = await db.query(
      `INSERT INTO services (provider_id, title, description, price, category, availability)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [providerId, title, description, price, category, availability]
    );

    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при создании услуги:', err);
    res.status(500).json({ error: 'Ошибка при добавлении услуги' });
  }
};

// Получить все услуги текущего поставщика
const getAllServices = async (req, res) => {
  const providerId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM services WHERE provider_id = $1',
      [providerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  createService,
  getAllServices,
};
