const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product: { type: String, required: true },          // Product name
  category: { type: String, required: true },         // NEW
  type: { type: String, required: true },             // Retail / Wholesale
  price: { type: Number, required: true },            // Money received
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
