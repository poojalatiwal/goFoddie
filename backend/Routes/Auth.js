const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const Food = require("../models/Food");
const User = require("../models/User");
const Order = require("../models/Orders");
const Address = require("../models/Address");

const { fetch, isAdmin } = require("../middleware/fetchdetails");

const jwtSecret = "HaHa";
const upload = multer({ storage: multer.memoryStorage() });

//CREATE USER
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    body("name").isLength({ min: 3 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const securePass = await bcrypt.hash(req.body.password, salt);

      const role = req.body.role === "admin" ? "admin" : "user";

      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePass,
        location: req.body.location,
        role
      });

      const token = jwt.sign(
        { user: { id: user.id, role: user.role } },
        jwtSecret
      );

      res.json({ success: true, authToken: token, role: user.role });
    } catch (err) {
      res.status(500).json({ success: false, error: "User already exists" });
    }
  }
);

//LOGIN
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(req.body.password, user.password);
      if (!ok) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { user: { id: user.id, role: user.role } },
        jwtSecret
      );

      res.json({ success: true, authToken: token, role: user.role });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

//GET USER 
router.post("/getuser", fetch, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

//UPLOAD PROFILE PHOTO
router.post("/profile/photoBase64", fetch, async (req, res) => {
  try {
    const { photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ success: false, message: "No image sent" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: photoBase64 },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });

  } catch (err) {
    console.error("PHOTO UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE PROFILE 
router.put("/updateProfile", fetch, async (req, res) => {
  try {
    const { name, email, phone, gender, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        phone,
        gender,
        bio
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//LIVE LOCATION
router.post("/getlocation", async (req, res) => {
  try {
    const { latlong } = req.body;

    if (!latlong || !latlong.lat || !latlong.long) {
      return res.status(400).json({ error: "Coordinates missing" });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlong.lat}&lon=${latlong.long}`;

    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    const response = await fetch(url, {
      headers: { "User-Agent": "gofood-app" }
    });

    const data = await response.json();

    if (!data || !data.display_name) {
      return res.json({ location: "" });
    }

    res.json({ location: data.display_name });

  } catch (err) {
    console.error("LIVE LOCATION ERROR:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

//FOOD DATA 
router.post("/foodData", async (req, res) => {
  try {
    const foods = await Food.find();

    const uniqueCats = [
      ...new Set(
        foods
          .map(f => f.categoryName?.trim().toLowerCase())
          .filter(Boolean)
      )
    ];

    const categories = uniqueCats.map(c => ({
      CategoryName: c.charAt(0).toUpperCase() + c.slice(1)
    }));

    res.json([foods, categories]);

  } catch (err) {
    console.error(" foodData route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/food", fetch, isAdmin, async (req, res) => {
  try {
    let { name, categoryName, img, description, options } = req.body;

    if (!name || !categoryName || !img)
      return res.status(400).json({ error: "Missing fields" });

    const food = await Food.create({
      name,
      categoryName: categoryName.trim(),
      img,
      description,
      options
    });

    res.json({ success: true, food });

  } catch (err) {
    console.error("ADD FOOD ERROR:", err);
    res.status(500).json({ error: "Failed to add food" });
  }
});


router.get("/addresses", fetch, async (req, res) => {
  const addresses = await Address.find({ userId: req.user.id });
  res.json(addresses);
});

// ADD NEW ADDRESS
router.post("/addresses", fetch, async (req, res) => {
  const address = await Address.create({
    ...req.body,
    userId: req.user.id,
  });
  res.json(address);
});

// UPDATE ADDRESS
router.put("/addresses/:id", fetch, async (req, res) => {
  const updated = await Address.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE ADDRESS
router.delete("/addresses/:id", fetch, async (req, res) => {
  await Address.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  res.json({ success: true });
});

// PLACE ORDER 
router.post("/placeOrder", fetch, async (req, res) => {
  try {
    const { items, totalPrice, address, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "Cart empty" });
    }

    const fixedItems = items.map(i => ({
      name: i.name,
      quantity: Number(i.qty),
      price: Number(i.price),
      size: i.size || ""
    }));

    const order = await Order.create({
      user: req.user.id,
      items: fixedItems,
      totalPrice,
      address: typeof address === "object" ? address.address : address,
      paymentMethod,
      status: "Preparing"
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

// MY ORDERS
router.get('/myOrderData', fetch, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    const now = Date.now();

    let updatedOrders = [];

    for (let order of orders) {
      const orderTime = new Date(order.createdAt).getTime();

      if (order.status === "Preparing" && now - orderTime >= 600000) {
        order.status = "Completed";
        await order.save(); 
      }

      updatedOrders.push(order);
    }

    res.json({ success: true, orders: updatedOrders });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE ACCOUNT 
router.delete("/deleteAccount", fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    await Order.deleteMany({ user: userId });
    await Address.deleteMany({ userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


const PDFDocument = require("pdfkit");

router.get("/invoice/:id", fetch, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    const orderDate = order.orderDate || order.createdAt || new Date();

    doc.fontSize(26).fillColor("#1f2933").text("GoFood", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor("#16a34a").text("INVOICE", { align: "center" });

    doc.moveDown(1);
    doc.strokeColor("#e5e7eb").lineWidth(1)
      .moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1);
    doc.fontSize(11).fillColor("#000");

    doc.text(`Order ID: ${order._id}`);
    doc.text(`Customer Name: ${order.user?.name || "N/A"}`);
    doc.text(`Order Date: ${new Date(orderDate).toLocaleString("en-IN")}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Delivery Address:");
    doc.font("Helvetica").text(order.address);

    doc.moveDown(1);
    doc.strokeColor("#e5e7eb")
      .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    const itemX = 50;
    const qtyX = 330;
    const priceX = 400;
    const totalX = 480;

    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(12);

    const headerY = doc.y; 

    doc.text("Item", itemX, headerY, { width: 260 });
    doc.text("Qty", qtyX, headerY, { width: 60, align: "right" });
    doc.text("Price", priceX, headerY, { width: 60, align: "right" });
    doc.text("Total", totalX, headerY, { width: 60, align: "right" });

    doc.y = headerY + 18;

    doc.strokeColor("#000")
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.font("Helvetica").fontSize(11);
    doc.moveDown(0.5);

    order.items.forEach((item, i) => {
      const rowY = doc.y; 

      const itemName =
        `${i + 1}. ${item.name}` +
        (item.size ? ` (${item.size})` : "");

      const total = item.price * item.quantity;

      doc.text(itemName, itemX, rowY, { width: 260 });
      doc.text(item.quantity.toString(), qtyX, rowY, { width: 60, align: "right" });
      doc.text(`₹${item.price}`, priceX, rowY, { width: 60, align: "right" });
      doc.text(`₹${total}`, totalX, rowY, { width: 60, align: "right" });

      const rowHeight = doc.heightOfString(itemName, { width: 260 });
      doc.y = rowY + rowHeight + 8;
    });

    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(14);
    doc.text(`Grand Total: ₹${order.totalPrice}`, 50, doc.y, {
      width: 500,
      align: "right"
    });

    doc.moveDown(3);
    doc.strokeColor("#e5e7eb")
      .moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(1);
    doc.fontSize(11).fillColor("#555")
      .text("Thank you for ordering from GoFood ❤️", { align: "center" });

    doc.fontSize(9)
      .text("This is a system generated invoice.", { align: "center" });

    doc.end();

  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

// CANCEL ORDER 
router.delete("/cancelOrder/:id", fetch, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already cancelled"
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;
