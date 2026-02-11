const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const multer = require("multer");
const auth = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

/* =============================
   PROTECTED ROUTES (AUTH)
============================= */

// ✅ Export & Upload FIRST (before :id)
router.get("/export/excel", auth, inventoryController.exportInventory);
router.post(
  "/upload/excel",
  auth,
  upload.single("file"),
  inventoryController.bulkUploadInventory
);

// Search
router.get("/search", auth, inventoryController.searchInventory);

// CRUD
router.post("/", auth, inventoryController.addInventory);
router.get("/", auth, inventoryController.getAllInventory);
router.get("/:id", auth, inventoryController.getInventoryById);
router.put("/:id", auth, inventoryController.updateInventory);
router.delete("/:id", auth, inventoryController.deleteInventory);

module.exports = router;
