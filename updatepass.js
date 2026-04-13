const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/eventify').then(async () => {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash('Shreya@53290', salt);
  
  await mongoose.connection.collection('users').updateOne(
    { rollNumber: '202510101150202' },
    { $set: { password: hash, isFirstLogin: false } }
  );
  
  console.log('Password updated successfully!');
  process.exit();
});