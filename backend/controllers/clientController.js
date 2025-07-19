
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// Регистрация клиента
const registerClient = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = await pool.query(
      "INSERT INTO clients (email, password, name) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, name]
    );
    res.json(newClient.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Вход клиента
const loginClient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const client = await pool.query("SELECT * FROM clients WHERE email = $1", [email]);
    if (client.rows.length === 0) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, client.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: client.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Профиль клиента
const getClientProfile = async (req, res) => {
  try {
    const client = await pool.query("SELECT * FROM clients WHERE id = $1", [req.user.id]);
    res.json(client.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  registerClient,
  loginClient,
  getClientProfile
};
