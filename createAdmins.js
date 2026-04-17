const mongoose = require('mongoose');
const User = require('./models/User');

// Use the environment variable you set in Render
const MONGO_URI = "mongodb+srv://Eventify_Shreya:GauriAkshara@cluster0.beapbo6.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to Atlas...');

  // 1. Delete the old broken/double-hashed accounts
  await User.deleteMany({ rollNumber: { $in: ['202510101150207', '202510101150200'] } });
  console.log('Old records cleared.');

  // 2. Create Gauri Mishra
  const admin1 = new User({
    rollNumber: '202510101150207',
    name:       'Gauri Mishra',
    password:   'Gauri@207', // 👈 PLAIN TEXT ONLY. User.js will hash it.
    department: 'ADMIN',
    year:       1,
    role:       'admin',
    isFirstLogin: false,
  });

  // 3. Create Akshara Singh
  const admin2 = new User({
    rollNumber: '202510101150200',
    name:       'Akshara Singh',
    password:   'Akshara@200', // 👈 PLAIN TEXT ONLY.
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