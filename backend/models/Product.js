const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },  
  quantity: { type: Number, required: true },  // ✅ added quantity
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
