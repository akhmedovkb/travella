// controllers/authController.js
import bcrypt from 'bcryptjs';
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
      password,
      description,
      languages,
      images // массив base64 строк
    } = req.body;

    // Валидация обязательных полей
    if (!email || !password || !name || !type) {
      return res.status(400).json({ error: 'Некоторые поля отсутствуют' });
    }

    // Проверка на существующего пользователя
    const existing = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Поставщик с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем в базу
    const result = await pool.query(
      `INSERT INTO providers 
       (type, name, location, contact_name, email, phone, password, description, languages, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        type,
        name,
        location,
        contactPerson,
        email,
        phone,
        hashedPassword,
        description,
        languages,
        images || [] // если нет картинок, сохраняем пустой массив
      ]
    );

    res.status(201).json({ message: 'Поставщик успешно зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
