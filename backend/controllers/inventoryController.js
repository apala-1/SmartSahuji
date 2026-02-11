const mongoose = require("mongoose");
const Inventory = require("../models/InventoryModel");
const xlsx = require("xlsx");
const fs = require("fs");

// =============================
// HELPER: Create or Update Inventory
// =============================
const createOrUpdateInventory = async (userId, data) => {
  const { name, company, barcode, quantityBought = 0 } = data;

  const existing = await Inventory.findOne({ user: userId, name, company, barcode });

  if (existing) {
    existing.quantityBought += Number(quantityBought);
    existing.currentStock += Number(quantityBought);
    existing.lastBoughtQty = Number(quantityBought);
    Object.assign(existing, data); // update other fields
    await existing.save();
    return existing;
  }

  const newItem = await Inventory.create({ user: userId, ...data });
  return newItem;
};

// =============================
// ADD INVENTORY
// =============================
exports.addInventory = async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      name: req.body.name?.trim(),
      company: req.body.company?.trim(),
      barcode: req.body.barcode?.trim().toUpperCase(),
      quantityBought: Number(req.body.quantityBought) || 0,
      currentStock: Number(req.body.currentStock) || 0,
      dateBought: req.body.dateBought ? new Date(req.body.dateBought) : Date.now(),
      itemType: req.body.itemType || "General",
      buyingPrice: Number(req.body.buyingPrice) || 0,
      sellingPrice: Number(req.body.sellingPrice) || 0,
      status: req.body.status || "Active",
      description: req.body.description || "",
    };

    const inventoryItem = await createOrUpdateInventory(req.user.id, itemData);
    res.json({
      message: "Inventory added/updated successfully",
      inventory: inventoryItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add inventory" });
  }
};

// =============================
// UPDATE INVENTORY BY ID
// =============================
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Inventory.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      { new: true }
    );

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
    const item = await Inventory.findOneAndDelete({ _id: id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Inventory deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete inventory" });
  }
};

// =============================
// GET ALL INVENTORY
// =============================
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ user: req.user.id }).sort({ dateBought: -1 });
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid inventory ID" });

    const item = await Inventory.findOne({ _id: id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Item not found" });

    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// =============================
// SEARCH INVENTORY
// =============================
exports.searchInventory = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ items: [] });

    const items = await Inventory.find({
      user: req.user.id,
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

// =============================
// AUTO-FILL INVENTORY
// =============================
exports.autofillInventory = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const item = await Inventory.findOne({
      user: req.user.id,
      $or: [{ name: query }, { barcode: query }],
    });

    if (!item) return res.json({});
    res.json({
      product_name: item.name,
      buyingPrice: item.buyingPrice,
      sellingPrice: item.sellingPrice,
      currentStock: item.currentStock,
      company: item.company,
      itemType: item.itemType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to autofill" });
  }
};

// =============================
// RECORD SALE (DECREASE STOCK)
// =============================
exports.recordSale = async (req, res) => {
  try {
    const { id, quantitySold } = req.body;
    const item = await Inventory.findOne({ _id: id, user: req.user.id });
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.currentStock < quantitySold)
      return res.status(400).json({ error: "Insufficient stock" });

    item.currentStock -= Number(quantitySold);
    await item.save();

    res.json({ message: "Sale recorded, stock updated", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record sale" });
  }
};

// =============================
// EXPORT INVENTORY TO EXCEL
// =============================
exports.exportInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ user: req.user.id });
    const data = inventory.map((item) => ({
      Name: item.name,
      Company: item.company,
      BuyingPrice: item.buyingPrice,
      SellingPrice: item.sellingPrice,
      QuantityBought: item.quantityBought,
      CurrentStock: item.currentStock,
      Category: item.itemType,
      DateBought: item.dateBought ? item.dateBought.toISOString().slice(0, 10) : "",
      Barcode: item.barcode,
      Description: item.description,
      Status: item.status,
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Inventory");

    const filePath = `inventory_${req.user.id}_${Date.now()}.xlsx`;
    xlsx.writeFile(wb, filePath);

    res.download(filePath, () => fs.unlinkSync(filePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export inventory" });
  }
};

// =============================
// BULK UPLOAD INVENTORY
// =============================
exports.bulkUploadInventory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of rows) {
      try {
        const mappedRow = {
          name: row.Name?.trim(),
          company: row.Company?.trim(),
          barcode: row.Barcode?.trim().toUpperCase(),
          quantityBought: Number(row.QuantityBought) || 0,
          currentStock: Number(row.CurrentStock) || 0,
          buyingPrice: Number(row.BuyingPrice) || 0,
          sellingPrice: Number(row.SellingPrice) || 0,
          itemType: row.Category || "General",
          dateBought: row.DateBought ? new Date(row.DateBought) : Date.now(),
          description: row.Description || "",
          status: row.Status || "Active",
        };

        if (!mappedRow.name || !mappedRow.company || !mappedRow.barcode) continue;
        await createOrUpdateInventory(req.user.id, mappedRow);
      } catch (errRow) {
        console.error("Skipping row due to error:", row, errRow.message);
      }
    }

    fs.unlinkSync(req.file.path);
    res.json({ message: "Bulk upload successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bulk upload failed" });
  }
};
