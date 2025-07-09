CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'provider'
);

CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50),
  name VARCHAR(100),
  contact_name VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  languages TEXT
);