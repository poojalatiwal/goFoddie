const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fetch, isAdmin } = require("../middleware/fetchdetails");
const User = require("../models/User");
const Food = require("../models/Food");
const Order = require("../models/Orders");
const LoginHistory = require("../models/LoginHistory");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

//ADMIN DASHBOARD 
router.get("/dashboard", fetch, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      users: totalUsers,
      orders: totalOrders,
      revenue: revenueAgg[0]?.total || 0
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET ALL FOOD
router.get("/food", fetch, isAdmin, async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/food", fetch, isAdmin, async (req, res) => {
  try {
    const { name, categoryName, img, description = "", options } = req.body;

    const food = await Food.create({
      name,
      categoryName: categoryName.trim(),
      img,
      description,
      options: [options]     
    });

    res.json({ success: true, food });

  } catch (err) {
    console.error("ADD FOOD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


//FOOD DATA
router.post("/foodData", async (req, res) => {
  try {
    const foods = await Food.find();

    const categoryMap = new Map();

    foods.forEach(food => {
      const rawCat = food.categoryName || food.CategoryName;
      if (!rawCat) return;

      const normalized = rawCat.trim().toLowerCase();

      if (!categoryMap.has(normalized)) {
        categoryMap.set(normalized, {
          CategoryName: rawCat.trim()
        });
      }
    });

    const categories = Array.from(categoryMap.values());

    res.json([foods, categories]);

  } catch (err) {
    console.error("🔥 foodData route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE FOOD
router.put("/food/:id", fetch, isAdmin, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    Object.assign(food, req.body);
    await food.save();

    res.json(food);
  } catch (err) {
    console.error("Update food error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE FOOD
router.delete("/food/:id", fetch, isAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ error: "Food not found" });

    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET USERS
router.get("/users", fetch, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE USER
router.delete("/users/:id", fetch, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id/block", fetch, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: req.body.isBlocked },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// GET ALL ORDERS
router.get("/orders", fetch, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE ORDER STATUS
router.put("/orders/:id/status", fetch, isAdmin, async (req, res) => {
  try {
    const allowedStatus = ["Pending", "Preparing", "Delivered", "Cancelled"];
    const { status } = req.body;

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// SALES REPORT
router.get("/sales", fetch, isAdmin, async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $substr: ["$orderDate", 0, 10] },
          totalSales: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      }
    ]);

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//ADMIN LOGIN 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admins only."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    await LoginHistory.create({ userId: user._id });

    res.json({ success: true, token, role: user.role });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//LOGGED-IN USERS 
router.get("/loggedin-users", fetch, isAdmin, async (req, res) => {
  try {
    const users = await LoginHistory.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// WEEKLY SALES REPORT
router.get("/weekly-sales", fetch, isAdmin, async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const sales = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, sales });

  } catch (err) {
    console.error("WEEKLY SALES ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;

