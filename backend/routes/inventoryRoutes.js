// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const multer = require("multer");


const upload = multer({ dest: "uploads/" });

// Search first
router.get("/search", inventoryController.searchInventory);

// CRUD Routes
router.post("/", inventoryController.addInventory);
router.get("/", inventoryController.getAllInventory);
router.get("/:id", inventoryController.getInventoryById);
router.put("/:id", inventoryController.updateInventory);
router.delete("/:id", inventoryController.deleteInventory);


//New Routes
router.get("/export/excel", inventoryController.exportInventory);
router.post("/upload/excel", upload.single("file"), inventoryController.bulkUploadInventory);

module.exports = router;
