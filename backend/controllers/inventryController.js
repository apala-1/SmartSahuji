const Product = require("../models/productModel");
const xlsx = require("xlsx");
const fs = require("fs");
const { default: InventoryPage } = require("../../frontend/react-app/src/pages/Inventory/Inventory");


//  Add single product
exports.addInventry = async (req, res) => {
    try{
        const {

         name, company, buyingPrice, sellingPrice, quantityBought,
      currentStock, itemType, dateBought, status, lastBoughtQty,
      supplierName, supplierContact, sku, minStock, reorderQty, description

        } = req.body;
//  Check if product already exists
        const existingInventory = await Inventory.findOne({name, company, sku});
        if(existingInventory){
            //  update Stock if product exists
            existingInventory.quantityBought += quantityBought;
            existingInventory.currentStock += quantityBought;
            existingInventory.lastBoughtQty = quantityBought;
            existingInventory.buyingPrice = buyingPrice || existingInventory.buyingPrice; // Update buying price
            existingInventory.sellingPrice = sellingPrice || existingInventory.sellingPrice; // Update selling price
            existingInventory.dateBought = dateBought || existingInventory.dateBought;
            existingInventory.status = status || existingInventory.status;
            //  optional fields
            existingInventory.supplierName = supplierName || existingInventory.supplierName;
            existingInventory.supplierContact = supplierContact || existingInventory.supplierContact;
            existingInventory.minStock = minStock || existingInventory.minStock;
            existingInventory.reorderQty = reorderQty || existingInventory.reorderQty;
            existingInventory.description = description || existingInventory.description;
            await existingInventory.save();
            return res.json({message: "Stock updated successfully", inventory: existingInventory});
    } 
    //  Create new product if it doesn't exist
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
    res.json({message: "Stock Added Sucessfully", inventory: newInventry});

} catch (err){
    console.error(err);
    res.status(500).json({error: " Failed to add stock"});
}
};

//  get all intevry item s

//  get all inventry 
// Get all inventory
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ dateBought: -1 });
    res.json({ inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

//  get single inventry item by id 

exports.getInventoryById = async (req, res) => {
    try{
        const { id } = req.params;
        const item = await Inventory.findById(id);
        if(!item) return res.status(404).json({error: "Item Not Found"});
        res.json({ item });

    } catch (err){
        console.error(err);
        res.status(500).json({error: "Failed to fetch item"});
    }
};

//  update inventory by Id 

exports.updateInventory = async (res, req) => {
    try{
        const { id } = req.params;
        const updates = req.body;

        const item = await Inventory.findByIdAndUpdate(id, updates, {new: true});
        if(!item) return res.status(404).json({error: "Item not found"});
        res.json ({message: "Item updated successfully", item});

    } catch (err){
        console.error(err);
            res.status(500).json({error : "Failed tp update stock"});
        }
    
};


//  delete sTOCK 

exports.deleteInventory = async (req, res) =>{
    try{
        cost (id) =  req.params;
        const item = await Inventory.findByIdAndDelete(id);
        if(!item) return res.status(404).json({error: "Item not found"});

        res.json({message: "Stock Deleted successfully"});

    } catch(err){
        console.error(err);
        res.status(500).json({error: " Failed to delete inventory"});
    }
};

// Search inventory by name, category, or company
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
