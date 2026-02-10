// routes/inventoryRoutes.js

const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// ==============================
// CRUD Routes for Inventory
// ==============================

// 1️⃣ Add new inventory or update stock if exists
router.post("/", inventoryController.addInventory);

// 2️⃣ Get all inventory items
router.get("/", inventoryController.getAllInventory);

// 3️⃣ Get single inventory item by ID
router.get("/:id", inventoryController.getInventoryById);

// 4️⃣ Update inventory item by ID
router.put("/:id", inventoryController.updateInventory);

// 5️⃣ Delete inventory item by ID
router.delete("/:id", inventoryController.deleteInventory);

// 6️⃣ Optional: Search inventory by name, company, or category
router.get("/search/query", inventoryController.searchInventory);

module.exports = router;
