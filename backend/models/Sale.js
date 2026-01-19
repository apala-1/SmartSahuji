const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
});

const Sale = mongoose.model("Sale", salesSchema);

module.exports = Sale;
