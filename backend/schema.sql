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
