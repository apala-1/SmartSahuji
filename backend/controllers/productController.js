const Product = require("../models/Product");
const XLSX = require("xlsx");
const fs = require("fs");
const { parse } = require("csv-parse/sync");

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { product_name, barcode, category, item_type, sale_type, price, cost, quantity, date } = req.body;

    if (!product_name || !category || !item_type || !quantity || !date) {
      return res.status(400).json({ error: "Product name, category, item_type, quantity, and date are required" });
    }

    if (item_type === "Sale") {
      if (!price || !sale_type) {
        return res.status(400).json({ error: "Sale requires price and sale_type" });
      }
    }

    if (item_type === "Purchase") {
      if (!cost) {
        return res.status(400).json({ error: "Purchase requires cost" });
      }
    }

    const newProduct = new Product({
      product_name,
      barcode,
      category,
      item_type,
      sale_type: item_type === "Sale" ? sale_type : null,
      price: item_type === "Sale" ? Number(price) : 0,
      cost: item_type === "Purchase" ? Number(cost) : 0,
      quantity: Number(quantity),
      date: new Date(date),
      user: req.user.id,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({ date: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", product: updated });
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

// Bulk upload CSV/XLSX
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;

  try {
    let products = [];

    if (req.file.mimetype === "text/csv") {
      const fileContent = fs.readFileSync(filePath);
      const rows = parse(fileContent, { columns: true, trim: true });

      rows.forEach((row) => {
        products.push({
          product_name: row.product_name || "Unnamed Product",
          barcode: row.barcode || "",
          category: row.category || "Other",
          item_type: row.item_type || "Other",
          sale_type: row.item_type === "Sale" ? row.sale_type || "Other" : null,
          price: row.item_type === "Sale" ? Number(row.price) || 0 : 0,
          cost: row.item_type === "Purchase" ? Number(row.cost) || 0 : 0,
          quantity: row.quantity ? Number(row.quantity) : 0,
          date: row.date ? new Date(row.date) : new Date(),
          user: req.user.id,
        });
      });
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      req.file.mimetype === "application/vnd.ms-excel"
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log("USER:", req.user);
      sheet.forEach((row) => {
        products.push({
          product_name: row.product_name || "Unnamed Product",
          barcode: row.barcode || "",
          category: row.category || "Other",
          item_type: row.item_type || "Other",
          sale_type: row.item_type === "Sale" ? row.sale_type || "Other" : null,
          price: row.item_type === "Sale" ? Number(row.price) || 0 : 0,
          cost: row.item_type === "Purchase" ? Number(row.cost) || 0 : 0,
          quantity: row.quantity ? Number(row.quantity) : 0,
          date: row.date ? new Date(row.date) : new Date(),
          user: req.user.id,
        });
      });
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (products.length > 0) {
      await Product.insertMany(products);
    }

    res.json({ message: "Products uploaded successfully", count: products.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    fs.unlinkSync(filePath);
  }
};
