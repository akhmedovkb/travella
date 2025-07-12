const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Требуется токен авторизации' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // содержит id и role
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

module.exports = verifyToken;
