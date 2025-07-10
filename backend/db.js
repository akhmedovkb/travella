// db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// Функция инициализации таблицы
export async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        type TEXT,
        name TEXT,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        password TEXT,
        description TEXT,
        location TEXT,
        languages TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица providers готова');
  } catch (err) {
    console.error('❌ Ошибка при создании таблицы:', err);
    throw err;
  }
}

export default pool;
