const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },  // e.g., Electronics, Clothing
  price: { type: Number, required: true },
});

module.exports = mongoose.model("Product", productSchema);
