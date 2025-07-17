const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Регистрация
const registerProvider = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    contact_name,
    location,
    type,
    description,
    languages,
    images,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO providers 
       (name, email, password, phone, contact_name, location, type, description, languages, images) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING *`,
      [
        name,
        email,
        hashedPassword,
        phone,
        contact_name,
        location,
        type,
        description,
        languages,
        images,
      ]
    );

    res.status(201).json({ message: "Провайдер зарегистрирован", provider: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
};

// Логин
const loginProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Провайдер не найден" });
    }

    const provider = result.rows[0];
    const valid = await bcrypt.compare(password, provider.password);

    if (!valid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const token = jwt.sign({ id: provider.id, role: "provider" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при входе" });
  }
};

// Получить профиль
const getProviderProfile = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM providers WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении профиля" });
  }
};

// Обновить профиль
const updateProviderProfile = async (req, res) => {
  const {
    name,
    email,
    phone,
    contact_name,
    location,
    type,
    description,
    languages,
    images,
    password,
  } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const result = await pool.query(
      `UPDATE providers SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        contact_name = COALESCE($4, contact_name),
        location = COALESCE($5, location),
        type = COALESCE($6, type),
        description = COALESCE($7, description),
        languages = COALESCE($8, languages),
        images = COALESCE($9, images),
        password = COALESCE($10, password)
       WHERE id = $11 RETURNING *`,
      [
        name,
        email,
        phone,
        contact_name,
        location,
        type,
        description,
        languages,
        images,
        hashedPassword,
        req.user.id,
      ]
    );

    res.json({ message: "Профиль обновлён", provider: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при обновлении профиля" });
  }
};

// Добавить услугу
const createService = async (req, res) => {
  const { title, description, price, category, images, availability } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, images, availability)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, title, description, price, category, images || [], availability || []]
    );

    res.status(201).json({ message: "Услуга добавлена", service: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при добавлении услуги" });
  }
};

// Получить услуги
const getProviderServices = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services WHERE provider_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении услуг" });
  }
};

// Обновить услугу
const updateService = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, images, availability } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        images = COALESCE($5, images),
        availability = COALESCE($6, availability)
       WHERE id = $7 AND provider_id = $8 RETURNING *`,
      [title, description, price, category, images, availability, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Услуга не найдена" });
    }

    res.json({ message: "Услуга обновлена", service: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при обновлении услуги" });
  }
};

// Удалить услугу
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM services WHERE id = $1 AND provider_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Услуга не найдена или уже удалена" });
    }

    res.json({ message: "Услуга удалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении услуги" });
  }
};

module.exports = {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  createService,
  getProviderServices,
  updateService,
  deleteService,
};
