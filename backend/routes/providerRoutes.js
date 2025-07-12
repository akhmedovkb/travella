const express = require("express");
const router = express.Router();
const pool = require("../db");
const providerAuth = require("../middleware/providerAuth");

// Регистрация поставщика
router.post("/register", async (req, res) => {
  const {
    type,
    name,
    contact_name,
    email,
    phone,
    password,
    description,
    location,
    languages,
    images,
  } = req.body;

  if (!type || !name || !contact_name || !email || !phone || !password || !location) {
    return res.status(400).json({ error: "Пожалуйста, заполните все поля" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO providers
      (type, name, contact_name, email, phone, password, description, location, languages, created_at, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
      RETURNING *`,
      [
        type,
        name,
        contact_name,
        email,
        phone,
        password,
        description,
        location,
        languages,
        images,
      ]
    );

    res.status(201).json({ message: "Поставщик успешно зарегистрирован", provider: result.rows[0] });
  } catch (err) {
    console.error("Ошибка при регистрации поставщика:", err);
    res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

// Получение профиля поставщика
router.get("/profile", providerAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM providers WHERE id = $1", [req.provider.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка получения профиля:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновление профиля поставщика
router.put("/profile", providerAuth, async (req, res) => {
  const { email, password, images } = req.body;
  try {
    await pool.query(
      `UPDATE providers SET email = $1, password = $2, images = $3 WHERE id = $4`,
      [email, password, images, req.provider.id]
    );
    res.json({ message: "Профиль обновлён" });
  } catch (err) {
    console.error("Ошибка обновления профиля:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// CRUD для услуг
router.get("/services", providerAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services WHERE provider_id = $1", [req.provider.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения услуг" });
  }
});

router.post("/services", providerAuth, async (req, res) => {
  const { title, description, price, category, images } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO services (provider_id, title, description, price, category, images, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [req.provider.id, title, description, price, category, images]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка добавления услуги" });
  }
});

router.put("/services/:id", providerAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, images } = req.body;
  try {
    await pool.query(
      `UPDATE services SET title = $1, description = $2, price = $3, category = $4, images = $5
      WHERE id = $6 AND provider_id = $7`,
      [title, description, price, category, images, id, req.provider.id]
    );
    res.json({ message: "Услуга обновлена" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка обновления услуги" });
  }
});

router.delete("/services/:id", providerAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM services WHERE id = $1 AND provider_id = $2", [id, req.provider.id]);
    res.json({ message: "Услуга удалена" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка удаления услуги" });
  }
});

module.exports = router;
