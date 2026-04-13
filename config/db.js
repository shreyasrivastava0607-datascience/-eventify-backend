const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We changed the line below to use your environment variable!
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected ✅');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;