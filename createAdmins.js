const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // 👉 We must import bcrypt
const User = require('./models/User');

// ⚠️ WARNING: DO NOT push this exact file to GitHub with this password in it!
const MONGO_URI = 'mongodb+srv://Eventify_Shreya:GauriAkshara@cluster0.beapbo6.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to Atlas...');

  await User.deleteMany({ rollNumber: { $in: ['202510101150207', '202510101150200'] } });
  console.log('Old records cleared.');

  // 👉 Encrypt the passwords before assigning them
  const hashedGauriPassword = await bcrypt.hash('Gauri@207', 12);
  const hashedAksharaPassword = await bcrypt.hash('Akshara@200', 12);

  const admin1 = new User({
    rollNumber: '202510101150207',
    name:       'Gauri Mishra',
    password:   hashedGauriPassword, // Save the encrypted version!
    department: 'ADMIN',
    year:       1,
    role:       'admin',
    isFirstLogin: false,
  });

  const admin2 = new User({
    rollNumber: '202510101150200',
    name:       'Akshara Singh',
    password:   hashedAksharaPassword, // Save the encrypted version!
    department: 'ADMIN',
    year:       1,
    role:       'admin',
    isFirstLogin: false,
  });

  await admin1.save();
  console.log('Admin 1 (Gauri Mishra) created securely!');

  await admin2.save();
  console.log('Admin 2 (Akshara Singh) created securely!');

  process.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});