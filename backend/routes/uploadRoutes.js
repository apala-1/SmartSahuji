const express = require("express");
const router = express.Router();
const multer = require("multer");
const Sale = require("../models/Sale");
const fs = require("fs");
const csv = require("csv-parser");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const formatted = results.map(row => ({
        product_name: row.product_name,
        category: row.category || "",
        quantity: Number(row.quantity),
        price: Number(row.price),
        date: new Date(row.date)
      }));

      try {
        await Sale.insertMany(formatted);
        res.json({ message: "CSV uploaded and saved to database!" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
});

module.exports = router;
