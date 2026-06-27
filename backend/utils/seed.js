const sequelize = require('../config/db');
const { Category, Product, User, Setting, Review } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ force: true });
    
    // Set auto-increment sequence start to 10000 (5-digits)
    await sequelize.query("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('orders', 9999);");
    console.log('✅ Database tables synchronized with auto-increment seed starting at 10000.');

    // 1. Create Default Settings
    console.log('🌱 Seeding Settings...');
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
      qrImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1624524458/sample.jpg',
      bakeryEmail: 'rjbakers@gmail.com',
      deliverySlots: JSON.stringify(defaultSlots),
      bakeryAddress: 'RJ Bakers, Shop No. 12, Baker Street, near Metro Station, New Delhi, Delhi 110001',
      deliveryChargeType: 'free',
      deliveryChargeAmount: 0.00
    });

    // 2. Create Users
    console.log('🌱 Seeding Users...');
    // Default Admin
    await User.create({
      name: 'RJ Bakers Admin',
      email: 'admin@rjbakers.com',
      password: 'admin123', // Hashed automatically by model hook
      role: 'admin'
    });

    // Default Customer
    await User.create({
      name: 'Rahul Sharma',
      email: 'customer@gmail.com',
      password: 'customer123', // Hashed automatically by model hook
      role: 'customer'
    });

    // 3. Create Categories
    console.log('🌱 Seeding Categories...');
    const catCakes = await Category.create({ name: 'Cakes' });
    const catCupcakes = await Category.create({ name: 'Cupcakes' });
    const catPastries = await Category.create({ name: 'Pastries' });
    const catCookies = await Category.create({ name: 'Cookies' });
    const catChocolates = await Category.create({ name: 'Chocolates' });
    const catSpecial = await Category.create({ name: 'Special Orders' });

    // 4. Create Products
    console.log('🌱 Seeding Products...');
    
    // Cakes
    const p1 = await Product.create({
      categoryId: catCakes.id,
      name: 'Chocolate Truffle Cake',
      price: 650.00,
      description: '1 Kg Rich Dark Chocolate Cake layers filled and iced with smooth chocolate ganache. Perfect for birthdays, anniversaries, and celebrations.',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      imageUrl2: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
      imageUrl3: 'https://images.unsplash.com/photo-1557925923-cd4648e21187?w=500',
      available: true
    });

    const p2 = await Product.create({
      categoryId: catCakes.id,
      name: 'Red Velvet Classic Cake',
      price: 750.00,
      description: '1 Kg Elegant crimson-colored chocolate cake layers with delicious premium cream cheese frosting and a velvety texture.',
      imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca9cf49d3ad7?w=500',
      imageUrl2: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500',
      imageUrl3: 'https://images.unsplash.com/photo-1505976378723-9726af54f153?w=500',
      available: true
    });

    // Cupcakes
    const p3 = await Product.create({
      categoryId: catCupcakes.id,
      name: 'Choco Lava Cupcake',
      price: 90.00,
      description: 'Decadent individual chocolate cupcake filled with warm liquid chocolate center.',
      imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60',
      imageUrl2: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500',
      available: true
    });

    const p4 = await Product.create({
      categoryId: catCupcakes.id,
      name: 'Strawberry Dream Cupcake',
      price: 80.00,
      description: 'Sweet strawberry cupcake topped with real fruit buttercream and sprinkles.',
      imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&auto=format&fit=crop&q=60',
      available: true
    });

    // Pastries
    await Product.create({
      categoryId: catPastries.id,
      name: 'Pineapple Pastry Slice',
      price: 70.00,
      description: 'Fluffy sponge cake layered with chopped pineapples, syrup, and fresh whipped cream.',
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&auto=format&fit=crop&q=60',
      available: true
    });

    await Product.create({
      categoryId: catPastries.id,
      name: 'Black Forest Pastry Slice',
      price: 80.00,
      description: 'Rich chocolate sponge soaked in cherry syrup, layered with sour cherries and fresh cream.',
      imageUrl: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500&auto=format&fit=crop&q=60',
      available: true
    });

    // Cookies
    await Product.create({
      categoryId: catCookies.id,
      name: 'Choco Chip Cookies (Box of 6)',
      price: 150.00,
      description: 'A box of 6 soft-baked cookies loaded with premium dark chocolate chips.',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
      available: true
    });

    // Chocolates
    await Product.create({
      categoryId: catChocolates.id,
      name: 'Handmade Truffles Box',
      price: 250.00,
      description: '12 assorted artisanal chocolates, including dark ganache, sea salt caramel, and hazelnut praline.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca817bc7?w=500',
      available: true
    });

    // Special Orders
    await Product.create({
      categoryId: catSpecial.id,
      name: 'Custom Tiered Cake Booking',
      price: 1000.00,
      description: 'Advance booking deposit for designing and planning custom multi-tier wedding or anniversary cakes.',
      imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500',
      available: true
    });

    // 5. Create Reviews
    console.log('🌱 Seeding Reviews...');
    await Review.bulkCreate([
      {
        productId: p1.id,
        customerName: 'Aarav Mehta',
        rating: 5,
        comment: 'Absolutely delicious! The chocolate was rich, smooth and not overly sweet. Will definitely order again.'
      },
      {
        productId: p1.id,
        customerName: 'Priya Sharma',
        rating: 4,
        comment: 'Very fresh and yummy cake. Delivery was right on time.'
      },
      {
        productId: p2.id,
        customerName: 'Rohit Verma',
        rating: 5,
        comment: 'Best Red Velvet cake in town! The cream cheese frosting is outstanding.'
      },
      {
        productId: p3.id,
        customerName: 'Neha Kapoor',
        rating: 5,
        comment: 'Melts in mouth! Warm it for 10 seconds, it is heaven.'
      }
    ]);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
