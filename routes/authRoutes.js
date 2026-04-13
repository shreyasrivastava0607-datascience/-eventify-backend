const express                                        = require("express");
const { adminCreateStudent, login, changePassword } = require("../controllers/authController");
const { protect, adminOnly }                        = require("../middleware/authMiddleware");

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/auth/login
// Anyone can attempt to log in
router.post("/login", login);

// ─── Protected Routes ─────────────────────────────────────────────────────────

// PATCH /api/auth/change-password
// Must be logged in — works for both students and admins
router.patch("/change-password", protect, changePassword);

// ─── Admin Only Routes ────────────────────────────────────────────────────────

// POST /api/auth/create-student
// Only admins can create student accounts
router.post("/create-student", protect, adminOnly, adminCreateStudent);

module.exports = router;