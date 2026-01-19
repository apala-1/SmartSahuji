const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

// Protected routes
router.post('/add', auth, productController.addProduct);
router.get('/all', auth, productController.getProducts);
router.delete('/delete/:id', auth, productController.deleteProduct);
router.put('/update/:id', auth, productController.updateProduct);

module.exports = router;
