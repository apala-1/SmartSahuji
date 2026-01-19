const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const salesRoutes = require("./routes/salesRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/sales_ai")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));