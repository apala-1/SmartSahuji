const express = require("express");
const router = express.Router();
const { getAllSales, getSummary, getMetrics } = require("../controllers/salesController");

router.get("/", getAllSales);

router.get("/summary", getSummary);

router.get("/metrics", getMetrics);

module.exports = router;



// 1 - excel sheet jasto system - null rakhna namile banaune

// 2 - data goes intoo mongo db 

// 3 - using daTA GIVEN ABOVE, analytics/diagrams throught ai (sales, trends, customer behaviours, best worst day, best worst product)

// 4 - also explanations of analytics through AI

// 5 - predictions