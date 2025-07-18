const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация
const registerProvider = async (req, res) => {
  const { name, email, password, type, location, contact_name, phone, description, languages, images } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO providers (name, email, password, type, location, contact_name, phone, description, languages, images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [name, email, hashedPassword, type, location, contact_name, phone, description, languages, images]
    );
    res.status(201).json({ message: 'Поставщик зарегистрирован', provider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
};

// Логин
const loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM providers WHERE email = $1', [email]);
    const provider = result.rows[0];
    if (!provider) return res.status(400).json({ error: 'Поставщик не найден' });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) return res.status(400).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ id: provider.id, role: 'provider' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка входа' });
  }
};

// Получить профиль
const getProviderProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
};

// Обновить профиль
const updateProviderProfile = async (req, res) => {
  const { name, email, type, location, contact_name, phone, description, languages, images, password } = req.body;
  try {
    let updateQuery = 'UPDATE providers SET name=$1, email=$2, type=$3, location=$4, contact_name=$5, phone=$6, description=$7, languages=$8, images=$9';
    const values = [name, email, type, location, contact_name, phone, description, languages, images];
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password=$10 WHERE id=$11 RETURNING *';
      values.push(hashedPassword, req.user.id);
    } else {
      updateQuery += ' WHERE id=$10 RETURNING *';
      values.push(req.user.id);
    }
    const result = await pool.query(updateQuery, values);
    res.json({ message: 'Профиль обновлен', provider: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};

// Создание услуги
const createService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO services (provider_id, title, description, price, category, availability) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, title, description, price, category, availability]
    );
    res.status(201).json({ message: 'Услуга добавлена', service: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка добавления услуги' });
  }
};

// Получение всех услуг
const getServices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE provider_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения услуг' });
  }
};

// Обновление услуги
const updateService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  try {
    const result = await pool.query(
      'UPDATE services SET title=$1, description=$2, price=$3, category=$4, availability=$5 WHERE id=$6 AND provider_id=$7 RETURNING *',
      [title, description, price, category, availability, req.params.id, req.user.id]
    );
    res.json({ message: 'Услуга обновлена', service: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления услуги' });
  }
};

// Удаление услуги
const deleteService = async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id=$1 AND provider_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления услуги' });
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  createService,
  getServices,
  updateService,
  deleteService,
};
