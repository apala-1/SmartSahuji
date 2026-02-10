const Inventory = require("../models/InventoryModel"); // Assuming Product model is used as Inventory
const xlsx = require("xlsx");
const fs = require("fs");

// =============================
// ADD OR UPDATE INVENTORY
// =============================
exports.addInventory = async (req, res) => {
  try {
    const {
      name,
      company,
      buyingPrice,
      sellingPrice,
      quantityBought,
      currentStock,
      itemType,
      dateBought,
      status,
      lastBoughtQty,
      supplierName,
      supplierContact,
      sku,
      minStock,
      reorderQty,
      description,
    } = req.body;

    // Check if product already exists
    let existingInventory = await Inventory.findOne({ name, company, sku });

    if (existingInventory) {
      // Update stock if product exists
      existingInventory.quantityBought += quantityBought;
      existingInventory.currentStock += quantityBought;
      existingInventory.lastBoughtQty = quantityBought;
      existingInventory.buyingPrice = buyingPrice || existingInventory.buyingPrice;
      existingInventory.sellingPrice = sellingPrice || existingInventory.sellingPrice;
      existingInventory.dateBought = dateBought || existingInventory.dateBought;
      existingInventory.status = status || existingInventory.status;
      existingInventory.supplierName = supplierName || existingInventory.supplierName;
      existingInventory.supplierContact = supplierContact || existingInventory.supplierContact;
      existingInventory.minStock = minStock || existingInventory.minStock;
      existingInventory.reorderQty = reorderQty || existingInventory.reorderQty;
      existingInventory.description = description || existingInventory.description;

      await existingInventory.save();
      return res.json({ message: "Stock updated successfully", inventory: existingInventory });
    }

    // Create new inventory if it doesn't exist
    const newInventory = new Inventory({
      name,
      company,
      buyingPrice,
      sellingPrice,
      quantityBought,
      currentStock: currentStock || quantityBought,
      lastBoughtQty: quantityBought,
      itemType,
      dateBought,
      status: status || "Active",
      supplierName,
      supplierContact,
      sku,
      minStock,
      reorderQty,
      description,
    });

    await newInventory.save();
    res.json({ message: "Stock added successfully", inventory: newInventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add stock" });
  }
};

// =============================
// GET ALL INVENTORY
// =============================
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ dateBought: -1 });
    res.json({ inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

// =============================
// GET INVENTORY BY ID
// =============================
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// =============================
// UPDATE INVENTORY BY ID
// =============================
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Inventory.findByIdAndUpdate(id, updates, { new: true });
    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Item updated successfully", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
};

// =============================
// DELETE INVENTORY BY ID
// =============================
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete inventory" });
  }
};

// =============================
// SEARCH INVENTORY
// =============================
exports.searchInventory = async (req, res) => {
  try {
    const { query } = req.query;
    const items = await Inventory.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } },
        { itemType: { $regex: query, $options: "i" } },
      ],
    }).sort({ dateBought: -1 });

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};
