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
    
    // 1. Explicitly select password to bypass "select: false" in Model
    const user = await User.findOne({ rollNumber: safeRollNumber }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // 2. Compare the plain text password with the hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // 3. Generate the Token (Requires JWT_SECRET in Render Env)
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      token,
      isFirstLogin: user.isFirstLogin,
      role: user.role,
      user: {
        id: user._id,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Admin: Create Student Account ── */
const adminCreateStudent = async (req, res) => {
  try {
    const { rollNumber, name, department, year, role } = req.body;

    if (!rollNumber || !department || !year || !name) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const safeRollNum = String(rollNumber).toUpperCase();
    const existing = await User.findOne({ rollNumber: safeRollNum });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    // Logic: Default password = FirstName@123
    const firstName = name.trim().split(' ')[0];
    const defaultPass = `${firstName}@123`;

    const newUser = new User({
      rollNumber: safeRollNum,
      name: name.trim(),
      password: defaultPass, // User model pre-save hook will hash this
      department,
      year,
      role: role || "student",
      isFirstLogin: true,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: `User created. Password: ${defaultPass}` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Change Password ── */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password." });

    // Update directly to avoid double-hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: req.user._id },
      { password: hashedPass, isFirstLogin: false }
    );

    res.status(200).json({ success: true, message: "Password updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, adminCreateStudent, changePassword };