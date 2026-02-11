const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// =============================
// INVENTORY ROUTES
// =============================

// Auto-fill product details (name or SKU)
router.get("/autofill", auth, inventoryController.autofillInventory);

// Search inventory by name, company, or type
router.get("/search", auth, inventoryController.searchInventory);

// Export inventory to Excel
router.get("/export/excel", auth, inventoryController.exportInventory);

// Bulk upload inventory from Excel
router.post("/upload/excel", auth, upload.single("file"), inventoryController.bulkUploadInventory);

// Add a new inventory item
router.post("/", auth, inventoryController.addInventory);

// Get all inventory items
router.get("/", auth, inventoryController.getAllInventory);

// Get a specific inventory item by ID
router.get("/:id", auth, inventoryController.getInventoryById);

// Update inventory item by ID
router.put("/:id", auth, inventoryController.updateInventory);

// Delete inventory item by ID
router.delete("/:id", auth, inventoryController.deleteInventory);

module.exports = router;
