const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    company: { type: String },
    barcode: { type: String },

    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number },

    quantityBought: { type: Number, required: true },
    currentStock: { type: Number, required: true },

    category: {
      type: String,
      enum: ["Electronics", "Groceries", "Clothing", "Accessories", "General"],
      default: "General",
    },

    dateBought: { type: Date, default: Date.now },
    status: { type: String, default: "Active" },

    supplierName: { type: String },
    supplierContact: { type: String },

    description: { type: String },
  },
  { timestamps: true }
);

// Unique index per user per barcode
inventorySchema.index({ user: 1, barcode: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
