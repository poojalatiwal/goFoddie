const express = require("express");
const router = express.Router();
const { fetch, isUser } = require("../middleware/fetchdetails");
const Order = require("../models/Orders");

// User Dashboard
router.get("/dashboard", fetch, isUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      name: req.user.name,
      email: req.user.email,
      totalOrders: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
