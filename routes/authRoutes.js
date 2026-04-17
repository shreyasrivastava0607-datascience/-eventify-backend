const express                                       = require("express");
const { adminCreateStudent, login, changePassword } = require("../controllers/authController");
const { protect, adminOnly }                        = require("../middleware/authMiddleware");

// 👉 Make sure to import your User model here! 
// Adjust the path "../models/User" if your file is named differently.
const User = require("../models/User"); 

const router = express.Router();

// ─── ⚠️ TEMPORARY FIX: DELETE AFTER RUNNING ⚠️ ────────────────────────────────
router.get('/reset-all-passwords', async (req, res) => {
    const bcrypt = require('bcrypt');
    const users = [
        // ... Paste the exact list of users and passwords Claude gave you here ...
    ];

    try {
        for (const u of users) {
            const hash = await bcrypt.hash(u.password, 12);
            await User.updateOne({ rollNumber: u.rollNumber }, { $set: { password: hash } });
        }
        res.json({ success: true, message: 'All passwords reset!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ──────────────────────────────────────────────────────────────────────────────

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