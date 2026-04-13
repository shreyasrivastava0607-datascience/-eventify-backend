const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

// ─── Protect Middleware ───────────────────────────────────────────────────────
/**
 * Verifies the JWT from the Authorization header.
 * Attaches the decoded user document to req.user for downstream use.
 * Usage: router.get("/route", protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the user from DB to ensure they still exist
    //    (handles cases where user was deleted after token was issued)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // 4. Attach user to request object for use in next middleware/controller
    req.user = user;
    next();

  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
    }
    next(error);
  }
};

// ─── Admin Only Middleware ────────────────────────────────────────────────────
/**
 * Restricts access to admin users only.
 * Must be used AFTER the protect middleware (requires req.user to be set).
 * Usage: router.post("/route", protect, adminOnly, controller)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admins only.",
  });
};

module.exports = { protect, adminOnly };