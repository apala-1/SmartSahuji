const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Check Authorization header first
  const authHeader = req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // get the token after "Bearer "
  }

  if (!token) return res.status(401).json({ error: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains user id
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token is not valid' });
  }
}

module.exports = auth;
