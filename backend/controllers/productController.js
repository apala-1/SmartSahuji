const Product = require("../models/Product");
const Inventory = require("../models/InventoryModel");
const XLSX = require("xlsx");
const fs = require("fs");
const { parse } = require("csv-parse/sync");


// =====================================================
// ADD PRODUCT (SALE / PURCHASE TRANSACTION)
// =====================================================
exports.addProduct = async (req, res) => {
  try {
    const {
      product_name,
      barcode,
      category,
      item_type,
      sale_type,
      price,
      cost,
      quantity,
      date,
    } = req.body;

    // ===========================
    // BASIC VALIDATION
    // ===========================
    if (!product_name || !item_type || !quantity || !date) {
      return res.status(400).json({
        error: "product_name, item_type, quantity and date are required",
      });
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      return res.status(400).json({
        error: "Quantity must be greater than 0",
      });
    }

    // ===========================
    // FIND INVENTORY ITEM FIRST
    // ===========================
    const inventoryItem = await Inventory.findOne({
      user: req.user.id,
      $or: [{ barcode }, { name: product_name }],
    });

    // ===========================
    // SALE VALIDATION
    // ===========================
    if (item_type === "Sale") {
      if (!inventoryItem) {
        return res.status(400).json({
          error: "Product not found in inventory",
        });
      }

      if (!price || !sale_type) {
        return res.status(400).json({
          error: "Sale requires price and sale_type",
        });
      }

      if (inventoryItem.currentStock <= 0) {
        return res.status(400).json({
          error: "Product is out of stock",
        });
      }

      if (inventoryItem.currentStock < qty) {
        return res.status(400).json({
          error: `Only ${inventoryItem.currentStock} items available`,
        });
      }
    }

    // ===========================
    // PURCHASE VALIDATION
    // ===========================
    if (item_type === "Purchase") {
      if (!cost) {
        return res.status(400).json({
          error: "Purchase requires cost",
        });
      }
    }

    // ===========================
    // CREATE TRANSACTION
    // ===========================
    const newProduct = await Product.create({
      product_name,
      barcode,
      category: category || inventoryItem?.category || "Other",
      item_type,
      sale_type: item_type === "Sale" ? sale_type : null,
      price: item_type === "Sale" ? Number(price) : 0,
      cost: item_type === "Purchase" ? Number(cost) : 0,
      quantity: qty,
      date: new Date(date),
      user: req.user.id,
    });

    // ===========================
    // UPDATE INVENTORY
    // ===========================
    if (inventoryItem) {
      // SALE
      if (item_type === "Sale") {
        inventoryItem.currentStock -= qty;
      }

      // PURCHASE
      if (item_type === "Purchase") {
        inventoryItem.currentStock += qty;
        inventoryItem.quantityBought =
          (inventoryItem.quantityBought || 0) + qty;
        inventoryItem.lastBoughtQty = qty;
        inventoryItem.buyingPrice =
          Number(cost) || inventoryItem.buyingPrice;
      }

      await inventoryItem.save();
    }

    res.status(201).json({
      message: "Transaction saved successfully",
      product: newProduct,
    });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({
      error: "Server error while saving transaction",
    });
  }
};



// =====================================================
// GET ALL PRODUCTS
// =====================================================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({
      date: -1,
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// =====================================================
// UPDATE PRODUCT
// =====================================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Product.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// =====================================================
// DELETE PRODUCT
// =====================================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted", id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// =====================================================
// BULK UPLOAD PRODUCTS (CSV / XLSX)
// =====================================================
exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    let products = [];

    // ===== CSV =====
    if (req.file.mimetype === "text/csv") {
      const fileContent = fs.readFileSync(filePath);
      const rows = parse(fileContent, { columns: true, trim: true });

      products = rows.map((row) => ({
        product_name: row.product_name || "Unnamed Product",
        barcode: row.barcode || "",
        category: row.category || "Other",
        item_type: row.item_type || "Other",
        sale_type:
          row.item_type === "Sale" ? row.sale_type || "Retail" : null,
        price:
          row.item_type === "Sale" ? Number(row.price) || 0 : 0,
        cost:
          row.item_type === "Purchase" ? Number(row.cost) || 0 : 0,
        quantity: Number(row.quantity) || 0,
        date: row.date ? new Date(row.date) : new Date(),
        user: req.user.id,
      }));
    }

    // ===== XLSX =====
    else {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName]
      );

      products = rows.map((row) => ({
        product_name: row.product_name || "Unnamed Product",
        barcode: row.barcode || "",
        category: row.category || "Other",
        item_type: row.item_type || "Other",
        sale_type:
          row.item_type === "Sale" ? row.sale_type || "Retail" : null,
        price:
          row.item_type === "Sale" ? Number(row.price) || 0 : 0,
        cost:
          row.item_type === "Purchase" ? Number(row.cost) || 0 : 0,
        quantity: Number(row.quantity) || 0,
        date: row.date ? new Date(row.date) : new Date(),
        user: req.user.id,
      }));
    }

    if (products.length > 0) {
      await Product.insertMany(products);
    }

    res.json({
      message: "Products uploaded successfully",
      count: products.length,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  } finally {
    fs.unlinkSync(filePath);
  }
};
