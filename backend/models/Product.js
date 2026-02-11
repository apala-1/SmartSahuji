const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },   // descriptive name
    barcode: { type: String, required: false },       // optional unique code
    category: { type: String, required: true },
    item_type: { type: String, enum: ["Sale", "Purchase"], required: true }, 
    sale_type: { type: String }, // only relevant if item_type === "Sale"
    price: { type: Number, default: 0 },   // relevant for sales
    cost: { type: Number, default: 0 },    // relevant for purchases
    quantity: { type: Number, required: true },
    date: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
