const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  title: {
    type: String,
    requried: true,
  },
  time: {
    type: String,
    required: true,
  },
  foodTags: {
    type: Array,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  foodType: {
    type: Array,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  restaurant: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  ratingCount: { type: String, default: "267" },
  description: { type: String, required: true },
  price: { type: String, required: true },
  additives: { type: Array, default: [] },
  imageUrl: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Food", FoodSchema);
