const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true, default: "none" },
  fcm: { type: String, required: true, default: "none" },
  password: { type: String, required: true },
  verification: { type: String, default: false },
  phone: { type: String, default: "0123456789" },
  phoneVerification: { type: Boolean, default: false },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: false,
  },
  userType: {
    type: String,
    required: true,
    default: "Client",
    enum: ["Client", "Admin", "Vendor", "Driver"],
  },
  profile: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2016/06/23/18/55/apple-1475977_1280.png",
    timestamps: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
