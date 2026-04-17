const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Eventify_Shreya:GauriAkshara@cluster0.beapbo6.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to Atlas...');

  // 1. Clear out the broken double-hashed accounts
  await User.deleteMany({ rollNumber: { $in: ['202510101150207', '202510101150200'] } });
  console.log('Old records cleared.');

  // 2. Create Gauri with a plain text password (User.js will hash it automatically)
  const admin1 = new User({
    rollNumber: '202510101150207',
    name:       'Gauri Mishra',
    password:   'Gauri@207', 
    department: 'ADMIN',
    year:       1,
    role:       'admin',
    isFirstLogin: false,
  });

  // 3. Create Akshara with a plain text password
  const admin2 = new User({
    rollNumber: '202510101150200',
    name:       'Akshara Singh',
    password:   'Akshara@200',
    department: 'ADMIN',
    year:       1,
    role:       'admin',
    isFirstLogin: false,
  });

  // 4. Save to the database
  await admin1.save();
  console.log('Admin 1 (Gauri Mishra) created securely!');

  await admin2.save();
  console.log('Admin 2 (Akshara Singh) created securely!');

  process.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});