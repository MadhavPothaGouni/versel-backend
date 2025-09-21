const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  quantity: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  reportDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sales", salesSchema);
