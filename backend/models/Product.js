const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product: { type: String, required: true },
  inventory: { type: Number, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // owner
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
