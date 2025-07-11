// middleware/clientAuth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function clientAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Нет токена авторизации' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.client = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}
