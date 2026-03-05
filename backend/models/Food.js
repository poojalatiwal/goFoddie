const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryName: { type: String, required: true },
  img: { type: String, required: true },
  description: { type: String },

options: [
  {
    small: Number,
    medium: Number,
    large: Number,
    half: Number,
    full: Number
  }
]});
module.exports = mongoose.model("Food", FoodSchema);
