const Product = require("../models/Product");
const csv = require("csv-parse");
const XLSX = require("xlsx");
const fs = require("fs");

// Add a new product (protected)
exports.addProduct = async (req, res) => {
  try {
    const { product, category, type, price, cost, date, quantity } = req.body;

    if (!product || !category || !type || !price || !cost || !date || !quantity)
      return res.status(400).json({ error: "All fields are required" });

    const newProduct = new Product({
      product,
      category,
      type,
      price,
      cost,
      quantity,            // ✅ added quantity
      date,
      user: req.user.id,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products for user
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({ date: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, user: req.user.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", id: product._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, category, type, price, cost, date, quantity } = req.body;

    const updated = await Product.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { product, category, type, price, cost, date, quantity }, // ✅ added quantity
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload CSV/XLSX
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;

  try {
    let products = [];

    // CSV
    if (req.file.mimetype === "text/csv") {
      const fileContent = fs.readFileSync(filePath);
      csv.parse(fileContent, { columns: true, trim: true }, (err, rows) => {
        if (err) return res.status(400).json({ error: "CSV parse error" });

        rows.forEach((row) => {
          products.push({
            product: row.product,
            category: row.category,
            type: row.type,
            price: Number(row.price),
            cost: Number(row.cost),
            quantity: Number(row.quantity),   // ✅ added quantity
            date: row.date,
            user: req.user.id,
          });
        });

        Product.insertMany(products)
          .then(() => res.json({ message: "Products uploaded successfully" }))
          .catch((e) => res.status(500).json({ error: e.message }));
      });
    } 
    // XLSX
    else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      req.file.mimetype === "application/vnd.ms-excel"
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      sheet.forEach((row) => {
        products.push({
          product: row.product,
          category: row.category,
          type: row.type,
          price: Number(row.price),
          cost: Number(row.cost),
          quantity: Number(row.quantity),   // ✅ added quantity
          date: row.date,
          user: req.user.id,
        });
      });

      await Product.insertMany(products);
      res.json({ message: "Products uploaded successfully" });
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    fs.unlinkSync(filePath);
  }
};
