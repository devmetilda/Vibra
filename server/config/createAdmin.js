const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@eventapp.com' });
    
    if (existingAdmin) {
      console.log('✅ Default admin account already exists');
      return;
    }

    // Create default admin account
    const adminUser = new User({
      fullName: 'System Administrator',
      email: 'admin@eventapp.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Default admin account created successfully');
    console.log('📧 Admin Email: admin@eventapp.com');
    console.log('🔑 Admin Password: Admin@123');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = createDefaultAdmin;
