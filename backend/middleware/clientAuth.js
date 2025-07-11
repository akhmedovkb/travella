import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const clientAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Отсутствует токен авторизации' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.client = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Неверный или истёкший токен' });
  }
};

export default clientAuth;
