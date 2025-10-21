require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Product = require('./models/Product')

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI

async function seedDatabase() {
  try {
    console.log('🔄 Starting database seeding...')
    console.log('📡 Connecting to MongoDB Atlas...')
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    })
    console.log('✅ Connected to MongoDB Atlas')
    console.log('📊 Database name:', mongoose.connection.db.databaseName)

    // Clear existing data (optional - remove this if you want to keep existing data)
    await User.deleteMany({})
    await Product.deleteMany({})
    console.log('🗑️ Cleared existing data')

    console.log('✅ Database cleared - ready for user registration')

    // Demo products data
    const demoProducts = [
      {
        name: 'Fresh Apples',
        description: 'Crisp and sweet red apples',
        price: 2.99,
        category: 'Fruits',
        stock: 50,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
      },
      {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas',
        price: 1.99,
        category: 'Fruits',
        stock: 30,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300'
      },
      {
        name: 'Fresh Milk',
        description: 'Whole milk, 1 gallon',
        price: 3.49,
        category: 'Dairy',
        stock: 25,
        unit: 'bottle',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300'
      },
      {
        name: 'Whole Wheat Bread',
        description: 'Fresh baked whole wheat bread',
        price: 2.49,
        category: 'Bakery',
        stock: 20,
        unit: 'piece',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
      }
    ]

    // Create products
    const createdProducts = await Product.insertMany(demoProducts)
    console.log(`✅ Created ${createdProducts.length} demo products`)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Ready for user registration - no demo accounts created')

  } catch (error) {
    console.error('❌ Seeding error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

seedDatabase()
