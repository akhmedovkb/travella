const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.providerId = decoded.providerId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

module.exports = auth;
