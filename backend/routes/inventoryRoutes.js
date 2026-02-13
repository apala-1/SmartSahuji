const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer config (temp uploads)
const upload = multer({ dest: "uploads/" });

// =============================
// INVENTORY ROUTES
// =============================

// Auto-fill product details (by name or barcode)
router.get(
  "/autofill",
  auth,
  inventoryController.autofillInventory
);

// Search inventory
router.get(
  "/search",
  auth,
  inventoryController.searchInventory
);

// Export inventory to Excel
router.get(
  "/export/excel",
  auth,
  inventoryController.exportInventory
);

// Bulk upload inventory from Excel
router.post(
  "/upload/excel",
  auth,
  upload.single("file"),
  inventoryController.bulkUploadInventory
);

// Record a sale (decrease stock)
router.post(
  "/sale",
  auth,
  inventoryController.recordSale
);

// Add inventory (create or update by barcode)
router.post(
  "/",
  auth,
  inventoryController.addInventory
);

// Get all inventory
router.get(
  "/",
  auth,
  inventoryController.getAllInventory
);

// Get inventory by ID
router.get(
  "/:id",
  auth,
  inventoryController.getInventoryById
);

// Update inventory by ID
router.put(
  "/:id",
  auth,
  inventoryController.updateInventory
);

// Delete inventory by ID
router.delete(
  "/:id",
  auth,
  inventoryController.deleteInventory
);

module.exports = router;
