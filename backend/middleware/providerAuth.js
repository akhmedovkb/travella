const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function providerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.providerId = decoded.providerId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
}

module.exports = providerAuth;
