const jwt = require('jsonwebtoken');
const pool = require('../db');

const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider || provider.password !== password) {
      return res.status(401).json({ error: 'Неверные email или пароль' });
    }

    const token = jwt.sign(
      { id: provider.id, role: 'provider' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, provider });
  } catch (err) {
    console.error('Ошибка при входе поставщика:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getProviderProfile = async (req, res) => {
  const providerId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json({ provider });
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера при загрузке профиля' });
  }
};

module.exports = {
  loginProvider,
  getProviderProfile,
};
