const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  pincode: String,
  state: String,
  house: String,
  address: String,
  town: String,
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
