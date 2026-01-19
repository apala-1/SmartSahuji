const express = require("express");
const router = express.Router();
const { generateInsights } = require("../controllers/insightsController");
const auth = require("../middleware/authMiddleware"); // make sure JWT is checked

// GET /api/insights
router.get("/", auth, generateInsights);

module.exports = router;
