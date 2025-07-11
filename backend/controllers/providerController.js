const pool = require('../db');
const jwt = require('jsonwebtoken');

const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (provider.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { id: provider.id, role: 'provider' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        type: provider.type,
      }
    });
  } catch (error) {
    console.error('Ошибка при входе поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
};

module.exports = { loginProvider };
