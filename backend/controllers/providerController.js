const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация
exports.registerProvider = async (req, res) => {
  const {
    name, email, password, phone, contact_name,
    type, languages, location, description, images
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO providers (name, email, password, phone, contact_name, type, languages, location, description, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, email, hashedPassword, phone, contact_name, type, languages, location, description, images]
    );
    res.status(201).json({ message: 'Поставщик зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Вход
exports.loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];

    if (!provider || !(await bcrypt.compare(password, provider.password))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: provider.id, role: 'provider' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение профиля
exports.getProviderProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление профиля
exports.updateProviderProfile = async (req, res) => {
  const { name, phone, contact_name, type, languages, location, description, images } = req.body;
  try {
    await pool.query(
      `UPDATE providers SET name=$1, phone=$2, contact_name=$3, type=$4,
       languages=$5, location=$6, description=$7, images=$8 WHERE id=$9`,
      [name, phone, contact_name, type, languages, location, description, images, req.user.id]
    );
    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить все услуги
exports.getProviderServices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE provider_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении услуг:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить услугу
exports.addService = async (req, res) => {
  const { title, description, price, category, availability, images } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, availability, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description, price, category, availability, images]
    );
    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при добавлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить услугу
exports.updateService = async (req, res) => {
  const serviceId = req.params.id;
  const { title, description, price, category, availability, images } = req.body;
  try {
    await pool.query(
      `UPDATE services SET title=$1, description=$2, price=$3, category=$4,
       availability=$5, images=$6 WHERE id=$7 AND provider_id=$8`,
      [title, description, price, category, availability, images, serviceId, req.user.id]
    );
    res.json({ message: 'Услуга обновлена' });
  } catch (err) {
    console.error('Ошибка при обновлении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить услугу
exports.deleteService = async (req, res) => {
  const serviceId = req.params.id;
  try {
    await pool.query('DELETE FROM services WHERE id=$1 AND provider_id=$2', [
      serviceId,
      req.user.id,
    ]);
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    console.error('Ошибка при удалении услуги:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
