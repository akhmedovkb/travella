// ✅ backend/routes/providerRoutes.js (добавим PUT маршрут)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
}

// PUT /api/providers/profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { first_name, last_name, phone, password, languages } = req.body;
  const { id } = req.user;

  try {
    const fields = [];
    const values = [];
    let index = 1;

    if (first_name) {
      fields.push(`first_name = $${index++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${index++}`);
      values.push(last_name);
    }
    if (phone) {
      fields.push(`phone = $${index++}`);
      values.push(phone);
    }
    if (languages) {
      fields.push(`languages = $${index++}`);
      values.push(JSON.stringify(languages));
    }
    if (password) {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${index++}`);
      values.push(hashed);
    }

    if (fields.length === 0) return res.json({ message: 'Нечего обновлять' });

    values.push(id);
    const query = `UPDATE providers SET ${fields.join(', ')} WHERE id = $${index}`;
    await db.query(query, values);

    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
