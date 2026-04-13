const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    rollNumber: {
      type:      String,
      required:  [true, "Roll number is required"],
      unique:    true,
      trim:      true,
      uppercase: true,
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },

    role: {
      type:    String,
      enum:    ["student", "admin"],
      default: "student",
    },

    name: {
      type:  String,
      trim:  true,
    },

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

    isFirstLogin: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-Save Hook: Hash Password ─────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Generate JWT ───────────────────────────────────────────
userSchema.methods.generateToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    {
      id:         this._id,
      role:       this.role,
      rollNumber: this.rollNumber,
      department: this.department, // ← FIXED: was missing
      year:       this.year,       // ← FIXED: was missing
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);