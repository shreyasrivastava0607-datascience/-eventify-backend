const bcrypt = require("bcrypt");
const User   = require("../models/User");

// ─── Admin: Create Student Account ───────────────────────────────────────────
const adminCreateStudent = async (req, res) => {
  try {
    const { rollNumber, department, year, role } = req.body;

    if (!rollNumber || !department || !year) {
      return res.status(400).json({
        success: false,
        message: "rollNumber, department, and year are required.",
      });
    }

   const existing = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A user with roll number ${rollNumber.toUpperCase()} already exists.`,
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("123", salt);
    const newUser = new User({
      rollNumber,
      password: hashedPassword,
      department,
      year,
      role:         role || "student",
      isFirstLogin: true,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Student account created. Default password is '123'.",
      data: {
        id:           newUser._id,
        rollNumber:   newUser.rollNumber,
        department:   newUser.department,
        year:         newUser.year,
        role:         newUser.role,
        isFirstLogin: newUser.isFirstLogin,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Roll number and password are required.",
      });
    }

    const user = await User.findOne({
      rollNumber: rollNumber.toUpperCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid roll number or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid roll number or password.",
      });
    }

    const token = user.generateToken();

    res.status(200).json({
      success:      true,
      message:      "Login successful.",
      token,
      isFirstLogin: user.isFirstLogin,
      role:         user.role,
      user: {
        id:         user._id,
        rollNumber: user.rollNumber,
        role:       user.role,
        department: user.department,
        year:       user.year,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt        = await bcrypt.genSalt(12);
    const hashedPass  = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: req.user._id },
      { password: hashedPass, isFirstLogin: false }
    );

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      token,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { adminCreateStudent, login, changePassword };