const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Add condition column to products table if it doesn't exist
const addConditionColumn = () => {
  return new Promise((resolve, reject) => {
    db.run(
      `ALTER TABLE products ADD COLUMN condition TEXT DEFAULT 'good'`,
      (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('✅ Condition column added to products table');
          resolve();
        }
      }
    );
  });
};

// Run migration
const runMigration = async () => {
  try {
    console.log('🔄 Running database migration...');
    await addConditionColumn();
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
};

runMigration();
