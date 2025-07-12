// backend/controllers/authController.js
const pool = require('../db');

const getProviderProfile = async (req, res) => {
  const providerId = req.provider.id;

  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    const provider = result.rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json(provider);
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении профиля' });
  }
};

const updateProviderProfile = async (req, res) => {
  const providerId = req.provider.id;
  const { email, password, images } = req.body;

  try {
    const result = await pool.query(
      `UPDATE providers
       SET email = $1,
           password = COALESCE(NULLIF($2, ''), password),
           images = $3
       WHERE id = $4
       RETURNING *`,
      [email, password, images, providerId]
    );

    res.json({ message: 'Профиль обновлён', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
};

module.exports = {
  getProviderProfile,
  updateProviderProfile,
};
