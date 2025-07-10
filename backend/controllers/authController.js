import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const registerProvider = async (req, res) => {
  const {
    type, name, location, contactPerson, email,
    phone, languages, password, description, images
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO providers 
        (type, name, location, contact_name, email, phone, languages, password, description, images) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        type, name, location, contactPerson, email,
        phone, languages.join(','), hashedPassword, description, images
      ]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован', id: result.rows[0].id });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: provider.id, email: provider.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ message: 'Успешный вход', token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};
