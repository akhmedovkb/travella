import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool();

export const registerProvider = async (req, res) => {
  const {
    type, name, contact_name, email, phone,
    password, description, location, languages
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO providers (type, name, contact_name, email, phone, password, description, location, languages)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [type, name, contact_name, email, phone, password, description, location, languages]
    );
    res.json({ message: 'Регистрация успешна' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};
