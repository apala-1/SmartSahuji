const mongoose = require("mongoose");
const Inventory = require("../models/InventoryModel");
const xlsx = require("xlsx");
const fs = require("fs");

/*
  Auth middleware sets: req.user = { id: "...mongoUserId..." }
*/

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
      DateBought: item.dateBought
        ? item.dateBought.toISOString().slice(0, 10)
        : "",
      SKU: item.sku,
      MinStock: item.minStock,
      ReorderQty: item.reorderQty,
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
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of rows) {
      try {
        const {
          Name,
          Company,
          SKU,
          QuantityBought = 0,
          BuyingPrice,
          SellingPrice,
          CurrentStock,
          Category,
          DateBought,
          MinStock,
          ReorderQty,
          Description,
          Status,
        } = row;

        if (!Name || !Company || !SKU) continue; // skip invalid row

        const name = Name.trim();
        const company = Company.trim();
        const sku = SKU.trim().toUpperCase();
        const qty = Number(QuantityBought) || 0;

        let existingInventory = await Inventory.findOne({
          user: req.user.id,
          name,
          company,
          sku,
        });

        if (existingInventory) {
          existingInventory.quantityBought += qty;
          existingInventory.currentStock += qty;
          existingInventory.lastBoughtQty = qty;
          existingInventory.buyingPrice =
            Number(BuyingPrice) || existingInventory.buyingPrice;
          existingInventory.sellingPrice =
            Number(SellingPrice) || existingInventory.sellingPrice;
          existingInventory.dateBought = DateBought
            ? new Date(DateBought)
            : existingInventory.dateBought;
          existingInventory.status = Status || existingInventory.status;
          existingInventory.minStock =
            Number(MinStock) || existingInventory.minStock;
          existingInventory.reorderQty =
            Number(ReorderQty) || existingInventory.reorderQty;
          existingInventory.description =
            Description || existingInventory.description;

          await existingInventory.save();
        } else {
          await Inventory.create({
            user: req.user.id,
            name,
            company,
            sku,
            quantityBought: qty,
            currentStock: Number(CurrentStock) || qty,
            lastBoughtQty: qty,
            buyingPrice: Number(BuyingPrice) || 0,
            sellingPrice: Number(SellingPrice) || 0,
            itemType: Category || "General",
            dateBought: DateBought ? new Date(DateBought) : Date.now(),
            status: Status || "Active",
            minStock: Number(MinStock) || 0,
            reorderQty: Number(ReorderQty) || 0,
            description: Description || "",
          });
        }
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

// =============================
// ADD OR UPDATE INVENTORY
// =============================
exports.addInventory = async (req, res) => {
  try {
    const {
      name,
      company,
      sku,
      quantityBought,
      currentStock,
      buyingPrice,
      sellingPrice,
      itemType,
      dateBought,
      status,
      supplierName,
      supplierContact,
      minStock,
      reorderQty,
      description,
    } = req.body;

    const nName = name.trim();
    const nCompany = company.trim();
    const nSKU = sku.trim().toUpperCase();
    const qty = Number(quantityBought) || 0;

    let existingInventory = await Inventory.findOne({
      user: req.user.id,
      name: nName,
      company: nCompany,
      sku: nSKU,
    });

    if (existingInventory) {
      existingInventory.quantityBought += qty;
      existingInventory.currentStock += qty;
      existingInventory.lastBoughtQty = qty;
      existingInventory.buyingPrice =
        Number(buyingPrice) || existingInventory.buyingPrice;
      existingInventory.sellingPrice =
        Number(sellingPrice) || existingInventory.sellingPrice;
      existingInventory.dateBought = dateBought
        ? new Date(dateBought)
        : existingInventory.dateBought;
      existingInventory.status = status || existingInventory.status;
      existingInventory.supplierName =
        supplierName || existingInventory.supplierName;
      existingInventory.supplierContact =
        supplierContact || existingInventory.supplierContact;
      existingInventory.minStock = Number(minStock) || existingInventory.minStock;
      existingInventory.reorderQty =
        Number(reorderQty) || existingInventory.reorderQty;
      existingInventory.description =
        description || existingInventory.description;

      await existingInventory.save();
      return res.json({
        message: "Stock updated successfully",
        inventory: existingInventory,
      });
    }

    const newInventory = await Inventory.create({
      user: req.user.id,
      name: nName,
      company: nCompany,
      sku: nSKU,
      quantityBought: qty,
      currentStock: Number(currentStock) || qty,
      lastBoughtQty: qty,
      buyingPrice: Number(buyingPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      itemType: itemType || "General",
      dateBought: dateBought ? new Date(dateBought) : Date.now(),
      status: status || "Active",
      supplierName,
      supplierContact,
      minStock: Number(minStock) || 0,
      reorderQty: Number(reorderQty) || 0,
      description,
    });

    res.json({ message: "Stock added successfully", inventory: newInventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add stock" });
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

    res.json({ message: "Stock deleted successfully" });
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
