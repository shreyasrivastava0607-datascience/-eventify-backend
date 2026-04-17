const express = require("express");
const router = express.Router();

// ─── Controller Import ───────────────────────────────────────────────────────
// NOTE: This must match your file name 'authController.js' exactly (Capital C)
const { 
  login, 
  adminCreateStudent, 
  changePassword 
} = require("../controllers/authController");

// ─── Middleware Imports ──────────────────────────────────────────────────────
// If you have authMiddleware, ensure these names match your files too
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ─── Routes ──────────────────────────────────────────────────────────────────

// Public: Student/Admin Login
router.post("/login", login);

// Protected: Admin only creates student accounts
router.post("/create-student", protect, adminOnly, adminCreateStudent);

// Protected: User can change their own password
router.post("/change-password", protect, changePassword);

module.exports = router;