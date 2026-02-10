const mongoose = require("mongoose");
const Inventory = require("../models/InventoryModel");
const xlsx = require("xlsx");
const fs = require("fs");

// =============================
// EXPORT INVENTORY TO EXCEL
// =============================
exports.exportInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();

    const data = inventory.map((item) => ({
      Name: item.name,
      Company: item.company,
      BuyingPrice: item.buyingPrice,
      SellingPrice: item.sellingPrice,
      QuantityBought: item.quantityBought,
      CurrentStock: item.currentStock,
      Category: item.itemType,
      DateBought: item.dateBought ? item.dateBought.toISOString().slice(0, 10) : "",
      SKU: item.sku,
      MinStock: item.minStock,
      ReorderQty: item.reorderQty,
      Description: item.description,
      Status: item.status,
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Inventory");

    const filePath = `inventory_export_${Date.now()}.xlsx`;
    xlsx.writeFile(wb, filePath);

    res.download(filePath, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export inventory" });
  }
};

// =============================
// BULK UPLOAD INVENTORY FROM EXCEL
// =============================
exports.bulkUploadInventory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (let row of data) {
      const {
        Name,
        Company,
        BuyingPrice,
        SellingPrice,
        QuantityBought,
        CurrentStock,
        Category,
        DateBought,
        SKU,
        MinStock,
        ReorderQty,
        Description,
        Status,
      } = row;

      let existingInventory = await Inventory.findOne({
        name: Name,
        company: Company,
        sku: SKU,
      });

      if (existingInventory) {
        existingInventory.quantityBought += Number(QuantityBought) || 0;
        existingInventory.currentStock += Number(CurrentStock) || 0;
        existingInventory.buyingPrice = BuyingPrice || existingInventory.buyingPrice;
        existingInventory.sellingPrice = SellingPrice || existingInventory.sellingPrice;
        existingInventory.dateBought = DateBought || existingInventory.dateBought;
        existingInventory.status = Status || existingInventory.status;
        existingInventory.minStock = MinStock || existingInventory.minStock;
        existingInventory.reorderQty = ReorderQty || existingInventory.reorderQty;
        existingInventory.description = Description || existingInventory.description;
        await existingInventory.save();
      } else {
        const newInventory = new Inventory({
          name: Name,
          company: Company,
          buyingPrice: BuyingPrice,
          sellingPrice: SellingPrice,
          quantityBought: QuantityBought,
          currentStock: CurrentStock || QuantityBought,
          lastBoughtQty: QuantityBought,
          itemType: Category,
          dateBought: DateBought,
          status: Status || "Active",
          sku: SKU,
          minStock: MinStock,
          reorderQty: ReorderQty,
          description: Description,
        });
        await newInventory.save();
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

    let existingInventory = await Inventory.findOne({ name, company, sku });

    if (existingInventory) {
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid inventory ID" });
    }

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
