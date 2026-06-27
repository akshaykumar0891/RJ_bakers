const sequelize = require('../config/db');
const { User, Setting } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('🔄 Database connected. Updating admin credentials and shop address...');

    // 1. Update or Create Admin User
    let adminUser = await User.findOne({ where: { email: 'avanthivusirikala@gmail.com' } });
    if (adminUser) {
      console.log('Found existing user with email avanthivusirikala@gmail.com. Updating name and password...');
      adminUser.name = 'admin';
      adminUser.role = 'admin';
      adminUser.password = 'Avanthirj@77300';
      await adminUser.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log('Admin user not found. Creating new admin user...');
      adminUser = await User.create({
        name: 'admin',
        email: 'avanthivusirikala@gmail.com',
        password: 'Avanthirj@77300',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully.');
    }

    // 2. Update Shop Settings
    let settings = await Setting.findOne();
    if (settings) {
      console.log('Updating existing settings with new address and email...');
      settings.bakeryAddress = 'Opposite Masjid, Jagadamba Center';
      settings.bakeryEmail = 'avanthivusirikala@gmail.com';
      await settings.save();
      console.log('✅ Shop settings updated successfully.');
    } else {
      console.log('No settings record found. Creating new settings record...');
      const defaultSlots = [
        { value: '10:00 AM', label: 'Morning (10:00 AM - 12:00 PM)', enabled: true },
        { value: '12:00 PM', label: 'Noon (12:00 PM - 02:00 PM)', enabled: true },
        { value: '02:00 PM', label: 'Afternoon (02:00 PM - 04:00 PM)', enabled: true },
        { value: '04:00 PM', label: 'Evening (04:00 PM - 06:00 PM)', enabled: true },
        { value: '06:00 PM', label: 'Late Evening (06:00 PM - 08:00 PM)', enabled: true },
        { value: '08:00 PM', label: 'Night (08:00 PM - 10:00 PM)', enabled: true }
      ];
      await Setting.create({
        upiId: 'rjbakers@upi',
        phoneNumber: '+919876543210',
        qrImageUrl: '/uploads/default-qr.jpg',
        bakeryEmail: 'avanthivusirikala@gmail.com',
        deliverySlots: JSON.stringify(defaultSlots),
        bakeryAddress: 'Opposite Masjid, Jagadamba Center',
        deliveryChargeType: 'free',
        deliveryChargeAmount: 0.00
      });
      console.log('✅ Shop settings created successfully.');
    }

  } catch (error) {
    console.error('❌ Error during update:', error);
  } finally {
    await sequelize.close();
    console.log('🔄 Database connection closed.');
  }
}

run();
