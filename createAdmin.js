const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/eventify')
  .then(async () => {
    console.log('Connected to MongoDB...');

    const rollNumber = '202510101150207';
    const rawPassword = 'Gauri@53242';

    // 1. DELETE ANY EXISTING VERSION OF THIS USER
    await User.deleteMany({ rollNumber: rollNumber.toUpperCase() });
    console.log('Old records wiped clean.');

    // 2. CREATE FRESH ADMIN
    const adminUser = new User({
      rollNumber: rollNumber,
      password: rawPassword, 
      department: 'ADMIN',
      year: 1,
      role: 'admin', // Double check this is lowercase 'admin'
      isFirstLogin: false
    });

    await adminUser.save();
    console.log(`✅ SUCCESS: ${rollNumber} is now a confirmed ADMIN.`);
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });