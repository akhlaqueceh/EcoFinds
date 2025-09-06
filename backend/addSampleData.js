const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample data
const sampleUsers = [
  {
    id: 1,
    username: 'eco_seller',
    email: 'seller@ecofinds.com',
    password: 'password123'
  },
  {
    id: 2,
    username: 'green_buyer',
    email: 'buyer@ecofinds.com',
    password: 'password123'
  }
];

const sampleProducts = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket in excellent condition. Perfect for sustainable fashion!',
    price: 25.99,
    category: 'clothing',
    condition: 'excellent',
    sellerId: 1,
    imageUrl: null
  },
  {
    id: 2,
    title: 'Wooden Coffee Table',
    description: 'Beautiful reclaimed wood coffee table. Eco-friendly and stylish!',
    price: 89.99,
    category: 'furniture',
    condition: 'good',
    sellerId: 1,
    imageUrl: null
  },
  {
    id: 3,
    title: 'Organic Cotton T-Shirt',
    description: 'Soft organic cotton t-shirt. Never worn, still has tags!',
    price: 12.50,
    category: 'clothing',
    condition: 'new',
    sellerId: 1,
    imageUrl: null
  },
  {
    id: 4,
    title: 'Bamboo Phone Case',
    description: 'Sustainable bamboo phone case for iPhone. Biodegradable and stylish!',
    price: 15.99,
    category: 'electronics',
    condition: 'excellent',
    sellerId: 1,
    imageUrl: null
  },
  {
    id: 5,
    title: 'Ceramic Plant Pot',
    description: 'Handmade ceramic pot perfect for your indoor plants. Made locally!',
    price: 18.75,
    category: 'home',
    condition: 'good',
    sellerId: 1,
    imageUrl: null
  },
  {
    id: 6,
    title: 'Vintage Books Collection',
    description: 'Collection of classic literature books. Great for book lovers!',
    price: 35.00,
    category: 'books',
    condition: 'good',
    sellerId: 1,
    imageUrl: null
  }
];

async function addSampleData() {
  try {
    console.log('🌱 Adding sample data to EcoFinds database...');

    // Clear existing data
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM products', (err) => {
          if (err) reject(err);
          else resolve();
        });
        db.run('DELETE FROM users', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // Add sample users
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
          [user.id, user.username, user.email, hashedPassword],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`✅ Added user: ${user.username}`);
    }

    // Add sample products
    for (const product of sampleProducts) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO products (id, title, description, price, category, condition, seller_id, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            product.id,
            product.title,
            product.description,
            product.price,
            product.category,
            product.condition,
            product.sellerId,
            product.imageUrl,
            new Date().toISOString()
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`✅ Added product: ${product.title}`);
    }

    console.log('🎉 Sample data added successfully!');
    console.log('📱 You can now test the app with:');
    console.log('   Email: seller@ecofinds.com');
    console.log('   Password: password123');
    console.log('   Or create a new account!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    db.close();
  }
}

addSampleData();
