// backend/middleware/providerAuth.js
const jwt = require('jsonwebtoken');

const providerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет токена авторизации' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.provider = decoded;
    next();
  } catch (err) {
    console.error('Ошибка проверки токена:', err);
    return res.status(403).json({ error: 'Неверный токен' });
  }
};

module.exports = providerAuth;
