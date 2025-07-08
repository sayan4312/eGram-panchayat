const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function createInitialAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await User.findOne({ email: 'admin@gp.in' });

    if (existing) {
      console.log('✅ Admin already exists:', existing.email);
    } else {
      const admin = await User.create({
        name: 'Gram Panchayat Admin',
        email: 'admin@gp.in',
        password: '123456',
        phone: '9999999999',
        aadhaarNumber: '123412341234',
        address: 'Head Office',
        role: 'admin',
        isActive: true,
        verified: true
      });

      console.log('✅ Admin created:', admin.email);
    }

    process.exit();
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
}

createInitialAdmin();
