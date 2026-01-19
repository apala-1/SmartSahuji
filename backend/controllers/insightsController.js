const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");

exports.getInsights = async (req, res) => {
  try {
    const sales = await Product.find({ user: req.user.id }).lean();

    if (!sales.length) {
      return res.json({
        total_sales: 0,
        top_product: null,
        top_category: null,
        summary: "No sales data available yet."
      });
    }

    const tempPath = path.join(__dirname, "sales_temp.json");
    fs.writeFileSync(tempPath, JSON.stringify(sales));

    const scriptPath = path.join(
      __dirname,
      "../../analytics/with_llm/generate_insights.py"
    );

    execFile("python", [scriptPath, tempPath], (error, stdout, stderr) => {
      fs.unlinkSync(tempPath);

      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: "Insight generation failed" });
      }

      try {
        const insights = JSON.parse(stdout);
        res.json(insights);
      } catch (err) {
        res.status(500).json({ error: "Invalid insight format" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
