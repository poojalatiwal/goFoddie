const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 5001;
const User = require('./models/User'); 

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "auth-token"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

require('./db')(function (err, data, CatData) {
  if (err) {
    console.log(" DB Error:", err);
  } else {
    global.foodData = data;
    global.foodCategory = CatData;
    console.log("✅ Food Data & Category loaded");
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/admin", require("./Routes/admin"));
app.use("/api/auth", require("./Routes/Auth"));
app.use("/api/user", require("./Routes/user"));


app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
