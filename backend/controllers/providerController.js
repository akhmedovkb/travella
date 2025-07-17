// controllers/providerController.js
const pool = require('../db');

// Прочие контроллеры: registerProvider, loginProvider, getProviderProfile, updateProviderProfile — остаются как есть

exports.addService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { title, description, price, category, availability } = req.body;

    const result = await pool.query(
      'INSERT INTO services (provider_id, title, description, price, category, availability, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [providerId, title, description, price, category, availability]
    );

    res.json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (error) {
    console.error('Ошибка добавления услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getServices = async (req, res) => {
  try {
    const providerId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM services WHERE provider_id = $1 ORDER BY created_at DESC',
      [providerId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { serviceId } = req.params;
    const { title, description, price, category, availability } = req.body;

    const result = await pool.query(
      `UPDATE services SET title = $1, description = $2, price = $3, category = $4, availability = $5
       WHERE id = $6 AND provider_id = $7 RETURNING *`,
      [title, description, price, category, availability, serviceId, providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена или нет доступа' });
    }

    res.json({ message: 'Услуга обновлена', service: result.rows[0] });
  } catch (error) {
    console.error('Ошибка обновления услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { serviceId } = req.params;

    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING *',
      [serviceId, providerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена или нет доступа' });
    }

    res.json({ message: 'Услуга удалена', service: result.rows[0] });
  } catch (error) {
    console.error('Ошибка удаления услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
