const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  let token = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to attach full object
    const user = await User.findById(decoded.id).select("-password"); // Exclude password
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // Now controllers have full user object including role
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token is not valid" });
  }
}

module.exports = auth;
