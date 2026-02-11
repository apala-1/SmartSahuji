const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    barcode: { type: String },
    category: { type: String, required: true },

    item_type: {
      type: String,
      enum: ["Sale", "Purchase", "Other"],
      required: true,
    },

    sale_type: { type: String },

    price: { type: Number, default: 0 }, // for Sale
    cost: { type: Number, default: 0 },  // for Purchase

    quantity: { type: Number, required: true },

    date: { type: Date, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
