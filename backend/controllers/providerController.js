const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

exports.loginProvider = async (req, res) => {
  const { email, password } = req.body;
  const provider = await pool.query("SELECT * FROM providers WHERE email = $1", [email]);
  if (provider.rows.length === 0) return res.status(404).json({ error: "Поставщик не найден" });

  const valid = await bcrypt.compare(password, provider.rows[0].password);
  if (!valid) return res.status(401).json({ error: "Неверный пароль" });

  const token = jwt.sign({ id: provider.rows[0].id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};
