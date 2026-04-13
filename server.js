// ─── Core Imports ────────────────────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// ─── Load Environment Variables ──────────────────────────────────────────────
dotenv.config();

// ─── App Initialization ──────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*", // Restrict in production
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());         // Parse incoming JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── Database Connection ──────────────────────────────────────────────────────
const connectDB = require("./config/db");
connectDB();

// ─── Route Mounting ───────────────────────────────────────────────────────────
app.use("/api/auth",   require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes")); 
// Example: app.use("/api/events", require("./routes/eventRoutes"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running..." });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Server Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});