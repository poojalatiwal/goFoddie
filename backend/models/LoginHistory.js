const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  loginAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
