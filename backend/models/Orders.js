const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },

    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        size: { type: String, default: "" }
      }
    ],

    totalPrice: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card"],
      default: "COD"
    },

    status: {
      type: String,
      enum: [
        "Preparing",
        "Out for delivery",
        "Delivered",
        "Cancelled","Completed"
      ],
      default: "Preparing"
    }
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model("Order", OrderSchema);
