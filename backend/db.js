import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

// ✅ Автоматическая миграция: создаёт таблицу, если её нет
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      password TEXT,
      description TEXT,
      location TEXT,
      languages TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Таблица providers готова');
};

export default pool;
