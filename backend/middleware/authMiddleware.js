const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  let token = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize user object
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
}

module.exports = auth;
