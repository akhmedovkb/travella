const pool = require('../db');

exports.getProviderServices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE provider_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка получения услуг:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO services (provider_id, title, description, price, category, availability) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, title, description, price, category, availability]
    );
    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    console.error("Ошибка создания услуги:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, availability } = req.body;
  try {
    const result = await pool.query(
      'UPDATE services SET title=$1, description=$2, price=$3, category=$4, availability=$5 WHERE id=$6 AND provider_id=$7 RETURNING *',
      [title, description, price, category, availability, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    res.json({ message: 'Услуга обновлена', service: result.rows[0] });
  } catch (err) {
    console.error("Ошибка обновления услуги:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM services WHERE id=$1 AND provider_id=$2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error("Ошибка удаления услуги:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
