const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require('../controllers/productController');

const auth = require('../middleware/authMiddleware'); // JWT middleware

router.post('/', auth, addProduct);
router.get('/', auth, getProducts);
router.delete('/:id', auth, deleteProduct);
router.put('/:id', auth, updateProduct);

module.exports = router;
