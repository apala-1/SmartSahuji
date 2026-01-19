const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  uploadFile,
} = require("../controllers/productController");

const auth = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/", auth, addProduct);
router.get("/", auth, getProducts);
router.delete("/:id", auth, deleteProduct);
router.put("/:id", auth, updateProduct);
router.post("/upload", auth, upload.single("file"), uploadFile);

module.exports = router;
