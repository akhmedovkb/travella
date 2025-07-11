const db = require('../db');

const createClient = async ({ name, email, password, phone }) => {
  const result = await db.query(
    'INSERT INTO clients (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password, phone]
  );
  return result.rows[0];
};

const getClientByEmail = async (email) => {
  const result = await db.query('SELECT * FROM clients WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createClient,
  getClientByEmail,
};
