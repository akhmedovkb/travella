// server/controllers/providerController.js
const pool = require('../db'); // подключение к PostgreSQL
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerProvider = async (req, res) => {
  try {
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

    // Проверка на существующий email
    const existing = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Такой email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newProvider = await pool.query(
      `INSERT INTO providers
        (type, name, contact_name, email, phone, password, description, location, languages)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [type, name, contact_name, email, phone, hashedPassword, description, location, languages]
    );

    // Сохраняем изображения в отдельной таблице (если есть)
    if (images && images.length > 0) {
      const providerId = newProvider.rows[0].id;
      for (const imageUrl of images) {
        await pool.query(
          'INSERT INTO provider_images (provider_id, image_url) VALUES ($1, $2)',
          [providerId, imageUrl]
        );
      }
    }

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { registerProvider };
