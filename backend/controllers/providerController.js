
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Регистрация поставщика
const registerProvider = async (req, res) => {
  const { email, password, name, type, languages, location, rating, reviews, images } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newProvider = await pool.query(
      "INSERT INTO providers (email, password, name, type, languages, location, rating, reviews, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [email, hashedPassword, name, type, languages, location, rating || 0, reviews || '[]', images || '']
    );
    res.json(newProvider.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Логин
const loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const provider = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
    if (provider.rows.length === 0) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, provider.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: provider.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Получить профиль
const getProviderProfile = async (req, res) => {
  try {
    const provider = await pool.query("SELECT * FROM providers WHERE id = $1", [req.user.id]);
    res.json(provider.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Обновить профиль
const updateProviderProfile = async (req, res) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (let key in req.body) {
    fields.push(`${key} = $${index}`);
    values.push(req.body[key]);
    index++;
  }

  try {
    const result = await pool.query(
      `UPDATE providers SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
      [...values, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Добавить услугу
const addService = async (req, res) => {
  const { title, description, price, category, images, availability } = req.body;
  try {
    const newService = await pool.query(
      "INSERT INTO services (provider_id, title, description, price, category, images, availability, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [req.user.id, title, description, price, category, images || '', availability || []]
    );
    res.json(newService.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Получить все услуги поставщика
const getServices = async (req, res) => {
  try {
    const services = await pool.query("SELECT * FROM services WHERE provider_id = $1", [req.user.id]);
    res.json(services.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Обновить услугу
const updateService = async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];
  let index = 1;

  for (let key in req.body) {
    fields.push(`${key} = $${index}`);
    values.push(req.body[key]);
    index++;
  }

  try {
    const result = await pool.query(
      `UPDATE services SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
      [...values, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Удалить услугу
const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM services WHERE id = $1", [id]);
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  addService,
  getServices,
  updateService,
  deleteService
};
