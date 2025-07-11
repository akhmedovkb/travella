const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient, getClientByEmail } = require('../models/clientModel');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/clients/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingClient = await getClientByEmail(email);
    if (existingClient) {
      return res.status(400).json({ error: 'Клиент с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = await createClient({ name, email, password: hashedPassword, phone });

    res.status(201).json({ message: 'Регистрация успешна', client: { id: newClient.id, name: newClient.name, email: newClient.email } });
  } catch (err) {
    console.error('Ошибка регистрации клиента:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
