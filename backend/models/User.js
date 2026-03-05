const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({
  name: { type: String },
  phone: { type: String },
  street: { type: String },
  district: { type: String },
  pincode: { type: String }
});

const UserSchema = new Schema({

  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  phone: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: ""
  },
  profilePhoto: {
    type: String,
    default: ""
  },
  date: {
    type: Date,
    default: Date.now
  },
  addresses: {
    type: [AddressSchema],
    default: []
  },
  bio: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('User', UserSchema);
