const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Eventify_Shreya:GauriAkshara@cluster0.beapbo6.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0';

const students = [
  { rollNumber: '202510101150202', name: 'Shreya Srivastava', password: 'Shreya@202', department: 'CSE', year: 1 },
  { rollNumber: '202511201120022', name: 'Prachi',            password: 'Prachi@022', department: 'BBA', year: 2 },
  { rollNumber: '202510101400100', name: 'Aanya Singh',       password: 'Aanya@100',  department: 'MBA', year: 3 },
  { rollNumber: '202510101150188', name: 'Achint',            password: 'Achint@183', department: 'CSE', year: 4 },
  { rollNumber: '202510101150210', name: 'Kanak Pandey',      password: 'Kanak@210',  department: 'ME',  year: 5 },
  { rollNumber: '202210101150202', name: 'Harshit Srivastava',password: 'Harshit@202',  department: 'CSE',  year: 4 },
  { rollNumber: '202511201120018', name: 'Rijul Rai',         password: 'Rijul@018',  department: 'BBA',  year: 2 },
  { rollNumber: '202511201120036', name: 'Bhanu Pratap Singh',password: 'Bhanu@036',  department: 'BBA',  year: 2 },
  { rollNumber: '202510101150105', name: 'Arpita Singh',      password: 'Arpita@105',  department: 'CSE',  year: 1 },



];

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to Atlas...');

  for (const s of students) {
    await User.deleteMany({ rollNumber: s.rollNumber.toUpperCase() });
    const student = new User({
      rollNumber:   s.rollNumber,
      name:         s.name,
      password:     s.password,
      department:   s.department,
      year:         s.year,
      role:         'student',
      isFirstLogin: true,
    });
    await student.save();
    console.log(`✅ Created: ${s.name} (${s.rollNumber})`);
  }

  console.log('All students created!');
  process.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});