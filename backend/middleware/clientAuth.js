const jwt = require('jsonwebtoken');

const clientAuth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена, доступ запрещен' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.client = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

module.exports = clientAuth;
