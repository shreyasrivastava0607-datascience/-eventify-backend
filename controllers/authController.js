const bcrypt = require("bcrypt");
const User   = require("../models/User");

/* ── Admin: Create Student/User Account ── */
const adminCreateStudent = async (req, res) => {
  try {
    const { rollNumber, name, department, year, role } = req.body;

    if (!rollNumber || !department || !year || !name) {
      return res.status(400).json({
        success: false,
        message: "rollNumber, name, department, and year are required.",
      });
    }

    // Wrap in String() to prevent crashes if frontend sends an integer
    const safeRollNumber = String(rollNumber).toUpperCase();

    const existing = await User.findOne({ rollNumber: safeRollNumber });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A user with roll number ${safeRollNumber} already exists.`,
      });
    }

    // Default password = FirstName@123
    const firstName     = name.trim().split(' ')[0];
    const defaultPass   = `${firstName}@123`;

    const newUser = new User({
      rollNumber: safeRollNumber,
      name: name.trim(),
      password:     defaultPass,  // Pre-save hook will hash this
      department,
      year,
      role:         role || "student",
      isFirstLogin: true,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: `User created. Default password: ${defaultPass}`,
      data: {
        id:           newUser._id,
        rollNumber:   newUser.rollNumber,
        name:         newUser.name,
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

/* ── Login ── */
const login = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ success: false, message: "Roll number and password are required." });
    }

    // Wrap in String() for safety
    const safeRollNumber = String(rollNumber).toUpperCase();
    
    // .select("+password") is correctly placed here!
    const user = await User.findOne({ rollNumber: safeRollNumber }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid roll number or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid roll number or password." });
    }

    // If Render Environment Variables are set, this will now succeed!
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
        name:       user.name,
        role:       user.role,
        department: user.department,
        year:       user.year,
      },
    });

  } catch (error) {
    // If JWT_SECRET is still missing, this will catch the crash and output it
    console.error("Login Error:", error.message); 
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Change Password ── */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    // Hash manually and update directly to avoid pre-save hook double-hashing
    const salt        = await bcrypt.genSalt(12);
    const hashedPass  = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: req.user._id },
      { password: hashedPass, isFirstLogin: false }
    );

    const updatedUser = await User.findById(req.user._id);
    const token       = updatedUser.generateToken();

    res.status(200).json({ success: true, message: "Password changed successfully.", token });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { adminCreateStudent, login, changePassword };