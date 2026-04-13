const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

/**
 * @typedef {Object} UserDocument
 *
 * User schema representing both students and admins.
 * Passwords are hashed automatically before saving via a pre-save hook.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    rollNumber: {
      type:     String,
      required: [true, "Roll number is required"],
      unique:   true,
      trim:     true,
      uppercase: true, // Normalize casing (e.g., "cs21001" → "CS21001")
    },

    // ── Authentication ──────────────────────────────────────────────────────
    password: {
      type:     String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:   false, // Never return password in queries by default
    },

    // ── Authorization ───────────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    {
        values:  ["student", "admin"],
        message: "Role must be either 'student' or 'admin'",
      },
      default: "student",
    },

    // ── Academic Info ───────────────────────────────────────────────────────
    department: {
      type:     String,
      required: [true, "Department is required"],
      trim:     true,
    },

    year: {
      type:     Number,
      required: [true, "Year is required"],
      min:      [1, "Year must be between 1 and 5"],
      max:      [5, "Year must be between 1 and 5"],
    },

    // ── UX State ────────────────────────────────────────────────────────────
    isFirstLogin: {
      type:    Boolean,
      default: true, // Forces password change on first login
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// ─── Pre-Save Hook: Hash Password ─────────────────────────────────────────────
/**
 * Hashes the password using bcrypt before saving to the database.
 * Only runs when the password field has been modified (avoids re-hashing).
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12); // Cost factor of 12 (production-safe)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
/**
 * Compares a plain-text password against the stored hashed password.
 * @param {string} candidatePassword - The password to verify.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Generate JWT ───────────────────────────────────────────
/**
 * Generates a signed JWT for the user.
 * Requires JWT_SECRET and JWT_EXPIRES_IN in environment variables.
 * @returns {string} - Signed JSON Web Token.
 */
userSchema.methods.generateToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id:         this._id,
      role:       this.role,
      rollNumber: this.rollNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);