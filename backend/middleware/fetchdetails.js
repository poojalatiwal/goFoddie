const jwt = require("jsonwebtoken");
const jwtSecret = "HaHa";

const fetch = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ error: "Invalid Auth Token" });
  }
  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data.user; 
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Auth Token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ error: "Access denied. User only." });
  }
  next();
};


module.exports = { fetch, isAdmin, isUser };
