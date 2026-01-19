const Product = require('../models/Product');

// Add a new product (protected)
exports.addProduct = async (req, res) => {
  try {
    const { product, inventory, type, price, date } = req.body;

    const newProduct = new Product({
      product,
      inventory,
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

// Update a product (optional)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, inventory, type, price, date } = req.body;

    const updated = await Product.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { product, inventory, type, price, date },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
