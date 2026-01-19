const Product = require('../models/Product');

// Add a new product (protected)
exports.addProduct = async (req, res) => {
  try {
    const { product, category, type, price, date } = req.body;

    // Validation: make sure all required fields exist
    if (!product || !category || !type || !price || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newProduct = new Product({
      product,
      category,
      type,
      price,
      date,
      user: req.user.id
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View all products for this user (protected)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }).sort({ date: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a product (protected)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, user: req.user.id });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted', id: product._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a product (protected)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, category, type, price, date } = req.body;

    // Only update the fields that exist in the request
    const updated = await Product.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { product, category, type, price, date },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
