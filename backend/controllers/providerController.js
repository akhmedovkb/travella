const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Регистрация поставщика
exports.registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      type,
      location,
      contact_name,
      phone,
      languages,
      description,
      images,
    } = req.body;

    const existing = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email уже зарегистрирован" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO providers 
       (name, email, password, type, location, contact_name, phone, languages, description, images) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING *`,
      [name, email, hashedPassword, type, location, contact_name, phone, languages, description, images]
    );

    const token = jwt.sign({ id: result.rows[0].id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Вход
exports.loginProvider = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Поставщик не найден" });

    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(401).json({ error: "Неверный пароль" });

    const token = jwt.sign({ id: result.rows[0].id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error("Ошибка при входе:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Получить профиль
exports.getProviderProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const result = await pool.query("SELECT * FROM providers WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при получении профиля:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Обновить профиль
exports.updateProviderProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const fields = [];
    const values = [];
    Object.entries(req.body).forEach(([key, value], index) => {
      fields.push(`${key} = $${index + 1}`);
      values.push(value);
    });

    if (fields.length === 0) return res.status(400).json({ error: "Нет данных для обновления" });

    const updateQuery = `UPDATE providers SET ${fields.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`;
    values.push(id);
    const result = await pool.query(updateQuery, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при обновлении профиля:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Создать услугу
exports.createService = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { title, description, price, category, availability, images } = req.body;
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, availability, images) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [provider_id, title, description, price, category, availability, images]
    );
    res.json({ message: "Услуга добавлена", service: result.rows[0] });
  } catch (err) {
    console.error("Ошибка при создании услуги:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Получить услуги
exports.getServices = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const result = await pool.query("SELECT * FROM services WHERE provider_id = $1", [provider_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении услуг:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Обновить услугу
exports.updateService = async (req, res) => {
  try {
    const id = req.params.id;
    const provider_id = req.user.id;
    const { title, description, price, category, availability, images } = req.body;

    const result = await pool.query(
      `UPDATE services SET 
        title = $1,
        description = $2,
        price = $3,
        category = $4,
        availability = $5,
        images = $6
       WHERE id = $7 AND provider_id = $8 RETURNING *`,
      [title, description, price, category, availability, images, id, provider_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Услуга не найдена" });
    res.json({ message: "Услуга обновлена", service: result.rows[0] });
  } catch (err) {
    console.error("Ошибка при обновлении услуги:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Удалить услугу
exports.deleteService = async (req, res) => {
  try {
    const id = req.params.id;
    const provider_id = req.user.id;
    const result = await pool.query("DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING *", [id, provider_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Услуга не найдена" });
    res.json({ message: "Услуга удалена" });
  } catch (err) {
    console.error("Ошибка при удалении услуги:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
