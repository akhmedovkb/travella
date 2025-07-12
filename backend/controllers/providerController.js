// backend/controllers/providerController.js
const pool = require('../db');

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
    images
  } = req.body;

  if (!type || !name || !contact_name || !email || !phone || !password || !location) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  try {
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
        password,
        description,
        location,
        languages,
        images
      ]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при регистрации поставщика:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

module.exports = {
  registerProvider,
};
