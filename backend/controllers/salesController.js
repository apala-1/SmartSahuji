const Sale = require("../models/Sale");

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find({});
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    res.json({ totalSales: totalSales[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMetrics = async (req, res) => {
  try {
    const metrics = await Sale.aggregate([
      {
        $group: {
          _id: "$product_name",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$price" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllSales, getSummary, getMetrics };
