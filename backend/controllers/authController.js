const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Update lastLogin and store session token
    user.lastLogin = new Date();
    user.sessions.push({ token });
    await user.save();

    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View all users (protected)
exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // remove password from output
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (protected)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted', userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};