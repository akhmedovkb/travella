const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

exports.registerProvider = async (req, res) => {
  const { email, password, name, type, location, contact_name, phone, description, languages, images } = req.body;

  const existing = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
  if (existing.rows.length > 0) return res.status(400).json({ error: "Поставщик уже зарегистрирован" });

  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO providers (email, password, name, type, location, contact_name, phone, description, languages, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [email, hashed, name, type, location, contact_name, phone, description, languages, images]
  );

  const token = jwt.sign({ id: result.rows[0].id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};

exports.loginProvider = async (req, res) => {
  const { email, password } = req.body;
  const provider = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
  if (provider.rows.length === 0) return res.status(404).json({ error: "Поставщик не найден" });

  const valid = await bcrypt.compare(password, provider.rows[0].password);
  if (!valid) return res.status(401).json({ error: "Неверный пароль" });

  const token = jwt.sign({ id: provider.rows[0].id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};

exports.getProviderProfile = async (req, res) => {
  const provider = await pool.query("SELECT * FROM providers WHERE id = $1", [req.user.id]);
  res.json(provider.rows[0]);
};

exports.updateProviderProfile = async (req, res) => {
  const fields = ['email', 'name', 'type', 'location', 'contact_name', 'phone', 'description', 'languages', 'images'];
  const updates = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = fields.map(f => req.body[f]);
  values.push(req.user.id);

  const updated = await pool.query(
    UPDATE providers SET ${updates} WHERE id = $${fields.length + 1} RETURNING *,
    values
  );
  res.json(updated.rows[0]);
};

exports.createService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  const result = await pool.query(
    `INSERT INTO services (provider_id, title, description, price, category, availability)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, title, description, price, category, availability]
  );
  res.json({ message: "Услуга добавлена", service: result.rows[0] });
};

exports.getServices = async (req, res) => {
  const result = await pool.query("SELECT * FROM services WHERE provider_id = $1", [req.user.id]);
  res.json(result.rows);
};

exports.updateService = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  const result = await pool.query(
    `UPDATE services SET title=$1, description=$2, price=$3, category=$4, availability=$5
     WHERE id=$6 AND provider_id=$7 RETURNING *`,
    [title, description, price, category, availability, req.params.id, req.user.id]
  );
  res.json({ message: "Услуга обновлена", service: result.rows[0] });
};

exports.deleteService = async (req, res) => {
  await pool.query("DELETE FROM services WHERE id = $1 AND provider_id = $2", [req.params.id, req.user.id]);
  res.json({ message: "Услуга удалена" });
};
