const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

// Middleware

// Middleware
app.use(cors());
app.use(express.json());

// 1. FIXED CONNECTION STRING: Changed 'localhost' to '127.0.0.1'
// Also added options for better stability
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartSahuji";

// Use the variable from your .env file
// Force the connection to use the IPv4 address directly in the code
mongoose.connect("mongodb://127.0.0.1:27017/smartSahuji", {
  serverSelectionTimeoutMS: 5000 // Stop waiting after 5 seconds
})
.then(() => console.log("✅ SUCCESS: MongoDB is now connected!"))
.catch(err => {
  console.error("❌ STILL FAILING: Is the MongoDB Service running?");
  console.error(err.message);
});

// Routes
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/inventory", inventoryRoutes);

// 2. USE PORT FROM ENV: Fallback to 5000 if not defined
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});