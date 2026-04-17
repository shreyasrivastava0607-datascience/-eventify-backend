const bcrypt = require("bcrypt");
const User = require("../models/User");

/* ── Login ── */
const login = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ success: false, message: "Roll number and password are required." });
    }

    const safeRollNumber = String(rollNumber).toUpperCase();
    
    // Explicitly select the password field
    const user = await User.findOne({ rollNumber: safeRollNumber }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user._id,
        rollNumber: user.rollNumber,
        name: user.name
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Admin: Create Student ── */
const adminCreateStudent = async (req, res) => {
  try {
    const { rollNumber, name, department, year } = req.body;
    const newUser = new User({ rollNumber, name, department, year });
    await newUser.save();
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Change Password ── */
const changePassword = async (req, res) => {
  // Logic for changing password
  res.status(200).json({ success: true, message: "Feature coming soon" });
};

module.exports = { login, adminCreateStudent, changePassword };