const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For reset tokens

// =============================
// REGISTER USER
// =============================
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if email or username already exists
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ error: "Email or username already in use" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({ username, email, password: hashed, role: role || "user" });
    await user.save();

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// LOGIN USER
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Update lastLogin and store session token
    user.lastLogin = new Date();
    user.sessions.push({ token });
    await user.save();

    res.json({ token, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// FORGOT PASSWORD
// =============================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // In production, send this link via email
    console.log(`Reset password link: http://localhost:3000/reset-password/${resetToken}`);

    res.json({ message: "Password reset link generated! Check your email (console for demo)." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful! You can login now." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// GET PROFILE (CURRENT USER ONLY)
// =============================
exports.getProfile = async (req, res) => {
  try {
    res.json({
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// UPDATE PROFILE (CURRENT USER ONLY)
// =============================
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (username) req.user.username = username;
    if (email) req.user.email = email;
    if (password) req.user.password = await bcrypt.hash(password, 10);

    await req.user.save();

    res.json({ message: "Profile updated successfully", user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// DELETE PROFILE (CURRENT USER ONLY)
// =============================
exports.deleteProfile = async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// VIEW ALL USERS (ADMIN ONLY)
// =============================
exports.viewUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// DELETE USER BY ID (ADMIN ONLY)
// =============================
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully", userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
