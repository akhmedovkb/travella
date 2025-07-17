// ✅ providerController.js — обновлённый
const db = require("../db");

exports.getProviderProfile = async (req, res) => {
  const result = await db.query("SELECT * FROM providers WHERE id = $1", [req.user.id]);
  res.json(result.rows[0]);
};

exports.updateProviderProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await db.query(
    "UPDATE providers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
    [name, email, phone, req.user.id]
  );
  res.json(result.rows[0]);
};

exports.getProviderServices = async (req, res) => {
  const result = await db.query("SELECT * FROM services WHERE provider_id = $1", [req.user.id]);
  res.json(result.rows);
};

exports.addService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  const result = await db.query(
    "INSERT INTO services (provider_id, title, description, price, category, availability) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [req.user.id, title, description, price, category, availability]
  );
  res.json({ message: "Услуга добавлена", service: result.rows[0] });
};

exports.updateService = async (req, res) => {
  const id = req.params.id;
  const { title, description, price, category, availability } = req.body;
  const result = await db.query(
    "UPDATE services SET title = $1, description = $2, price = $3, category = $4, availability = $5 WHERE id = $6 AND provider_id = $7 RETURNING *",
    [title, description, price, category, availability, id, req.user.id]
  );
  res.json({ message: "Обновлено", service: result.rows[0] });
};

exports.deleteService = async (req, res) => {
  const id = req.params.id;
  await db.query("DELETE FROM services WHERE id = $1 AND provider_id = $2", [id, req.user.id]);
  res.json({ message: "Удалено" });
};
