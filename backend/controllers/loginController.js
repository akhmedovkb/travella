// backend/controllers/loginController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM providers WHERE email = $1 AND password = $2',
      [email, password]
    );

    const provider = result.rows[0];

    if (!provider) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: provider.id, role: 'provider' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { loginProvider };
