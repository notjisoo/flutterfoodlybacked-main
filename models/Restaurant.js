const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // 餐厅食品数组
  foods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: [],
    },
  ],
  pickup: {
    type: Boolean,
    default: true,
  },
  delivery: {
    type: String,
    default: "自提",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  code: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  ratingCount: {
    type: String,
    default: "267",
  },
  verification: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Verified", "Rejected"],
  },
  verificationMessage: {
    type: String,
    default:
      "Your restaurant is under review. We will notify you once it is verified",
  },
  coords: {
    id: { type: String },
    latitude: { type: Number, required: true },
    longitude: {
      type: Number,
      required: true,
    },
    latitudeDelta: { type: Number, default: 0.01222 },
    address: { type: String, required: true },
    title: {
      type: String,
      required: true,
    },
  },
  earnings: { type: Number, default: 0.47856 },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
