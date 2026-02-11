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
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number },
    quantityBought: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    itemType: { type: String },
    dateBought: { type: Date, default: Date.now },
    status: { type: String, default: "Active" },
    lastBoughtQty: { type: Number, default: 0 },
    supplierName: { type: String },
    supplierContact: { type: String },
    sku: { type: String },
    minStock: { type: Number, default: 0 },
    reorderQty: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

// ✅ Prevent same SKU per user
inventorySchema.index({ user: 1, sku: 1 }, { unique: false });

module.exports = mongoose.model("Inventory", inventorySchema);
