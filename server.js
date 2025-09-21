const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Controllers
const { getSales, addSale } = require("./controllers/salesController");

// Routes
app.get("/api/sales", getSales);
app.post("/api/sales", addSale); // For adding new sale

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB connection error:", err));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});

// Socket.io for real-time updates
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
app.set("io", io); // Make io accessible in controllers

io.on("connection", (socket) => {
  console.log("🔌 New client connected");
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});
