// server/controllers/providerController.js
import pool from '../db.js';

export const registerProvider = async (req, res) => {
  const {
    type, name, location, contact_name, email, phone,
    password, description, languages
  } = req.body;

  try {
    const query = `
      INSERT INTO providers
      (type, name, location, contact_name, email, phone, password, description, languages, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
      RETURNING *;
    `;
    const values = [type, name, location, contact_name, email, phone, password, description, languages];

    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Регистрация успешна', provider: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации поставщика' });
  }
};
