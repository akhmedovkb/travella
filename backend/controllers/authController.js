const bcrypt = require('bcrypt');
const db = require('../db');

exports.registerProvider = async (req, res) => {
  const {
    type, name, contact_name, email, phone, password, description, location, languages
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await db.query(
      'INSERT INTO users (email, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, phone, hashedPassword, 'provider']
    );

    const userId = userResult.rows[0].id;

    await db.query(
      `INSERT INTO providers (user_id, type, name, contact_name, description, location, languages) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, type, name, contact_name, description, location, languages]
    );

    res.status(201).json({ message: 'Provider registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};