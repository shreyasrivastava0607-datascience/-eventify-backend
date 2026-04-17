const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://Eventify_Shreya:GauriAkshara@cluster0.beapbo6.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0';

const users = [
  { rollNumber: '202510101150207', password: 'Gauri@207' },
  { rollNumber: '202510101150200', password: 'Akshara@200' },
  { rollNumber: '202510101150202', password: 'Shreya@202' },
  { rollNumber: '202511201120022', password: 'Prachi@022' },
  { rollNumber: '202510101400100', password: 'Aanya@100' },
  { rollNumber: '202510101150188', password: 'Achint@183' },
  { rollNumber: '202510101150210', password: 'Kanak@210' },
  { rollNumber: '202210101150202', password: 'Harshit@202' },
  { rollNumber: '202511201120018', password: 'Rijul@018' },
  { rollNumber: '202511201120036', password: 'Bhanu@036' },
  { rollNumber: '202510101150105', password: 'Arpita@105' },
];

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected...');
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    const result = await mongoose.connection.collection('users').updateOne(
      { rollNumber: u.rollNumber },
      { $set: { password: hash } }
    );
    if (result.matchedCount > 0) {
      console.log('Reset: ' + u.rollNumber + ' -> ' + u.password);
    } else {
      console.log('Not found: ' + u.rollNumber);
    }
  }
  console.log('All done!');
  process.exit();
}).catch(function(err) {
  console.error(err);
  process.exit(1);
});