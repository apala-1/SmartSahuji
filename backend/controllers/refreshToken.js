// REFRESH ACCESS TOKEN
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "No refresh token provided" });

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ error: "Invalid refresh token" });

    // Issue new access token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};
