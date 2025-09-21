const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },   // e.g., North, South, East, West
  type: { type: String, required: true },     // Individual or Business
});

module.exports = mongoose.model("Customer", customerSchema);
