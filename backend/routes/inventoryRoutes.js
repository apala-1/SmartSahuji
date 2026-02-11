const express = require("express");
const router = express.Router();
const multer = require("multer");

const inventoryController = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");

// Multer config for Excel uploads
const upload = multer({ dest: "uploads/" });

/* =============================
   PROTECTED ROUTES (AUTH)
============================= */

// Export inventory to Excel
router.get("/export/excel", auth, inventoryController.exportInventory);

// Bulk upload inventory via Excel
router.post(
  "/upload/excel",
  auth,
  upload.single("file"),
  inventoryController.bulkUploadInventory
);

// Search inventory
router.get("/search", auth, inventoryController.searchInventory);

// CRUD operations
router.post("/", auth, inventoryController.addInventory);
router.get("/", auth, inventoryController.getAllInventory);
router.get("/:id", auth, inventoryController.getInventoryById);
router.put("/:id", auth, inventoryController.updateInventory);
router.delete("/:id", auth, inventoryController.deleteInventory);

module.exports = router;
