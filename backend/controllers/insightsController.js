const Product = require("../models/Product");

// Generate insights from MongoDB sales
exports.generateInsights = async (req, res) => {
  try {
    // Fetch all sales for this user
    const sales = await Product.find({ user: req.user.id });

    if (!sales.length) {
      return res.json({ insights: ["No sales data available."] });
    }

    // Aggregation
    const categorySales = {};
    const productSales = {};

    let totalSales = 0;

    sales.forEach((s) => {
      totalSales += s.price;
      categorySales[s.category] = (categorySales[s.category] || 0) + s.price;
      productSales[s.product] = (productSales[s.product] || 0) + s.price;
    });

    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
    const topCategory = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0];
    const totalTransactions = sales.length;

    // Simple insights generation
    const insights = [
      `Total sales: Rs ${totalSales}`,
      `Number of transactions: ${totalTransactions}`,
      `Top-selling product: ${topProduct[0]} (Rs ${topProduct[1]})`,
      `Top-selling category: ${topCategory[0]} (Rs ${topCategory[1]})`,
      `Suggestion: Focus on ${topCategory[0]} category and ${topProduct[0]} to maximize revenue`
    ];

    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate insights" });
  }
};
