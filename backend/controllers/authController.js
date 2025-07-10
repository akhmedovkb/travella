// controllers/authController.js
import pool from '../db.js';

export const registerProvider = async (req, res) => {
  try {
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

    const query = `
      INSERT INTO providers 
      (type, name, location, contact_name, email, phone, languages, password, description, images) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      type,
      name,
      location,
      contactPerson,
      email,
      phone,
      JSON.stringify(languages),
      password,
      description,
      images // base64 string or array
    ];

    await pool.query(query, values);

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации поставщика' });
  }
};
