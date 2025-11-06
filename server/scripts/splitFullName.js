const { dbHelpers } = require('../config/database');

async function splitFullName() {
  try {
    console.log('Splitting full_name column into first_name and last_name...');
    
    // Step 1: Add new columns
    console.log('Adding first_name and last_name columns...');
    try {
      await dbHelpers.run('ALTER TABLE users ADD COLUMN first_name TEXT');
      await dbHelpers.run('ALTER TABLE users ADD COLUMN last_name TEXT');
      console.log('✅ New columns added successfully');
    } catch (error) {
      if (error.message.includes('duplicate column')) {
        console.log('ℹ️  Columns already exist');
      } else {
        throw error;
      }
    }
    
    // Step 2: Migrate existing data
    console.log('Migrating existing data from full_name...');
    const users = await dbHelpers.all('SELECT id, full_name FROM users WHERE full_name IS NOT NULL AND full_name != ""');
    
    if (users.length > 0) {
      console.log(`Found ${users.length} user(s) with full_name data`);
      
      for (const user of users) {
        const parts = user.full_name.trim().split(' ');
        
        if (parts.length === 1) {
          // Only one name - put it in first_name
          await dbHelpers.run(
            'UPDATE users SET first_name = ?, last_name = NULL WHERE id = ?',
            [parts[0], user.id]
          );
        } else if (parts.length === 2) {
          // Two names - first and last
          await dbHelpers.run(
            'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
            [parts[0], parts[1], user.id]
          );
        } else {
          // Multiple names - first word is first_name, rest is last_name
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          await dbHelpers.run(
            'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
            [firstName, lastName, user.id]
          );
        }
      }
      
      console.log('✅ Data migration completed successfully');
    } else {
      console.log('ℹ️  No existing users to migrate');
    }
    
    // Step 3: Show summary
    const stats = await dbHelpers.all(`
      SELECT 
        COUNT(*) as total,
        COUNT(first_name) as with_first_name,
        COUNT(last_name) as with_last_name
      FROM users
    `);
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total users: ${stats[0].total}`);
    console.log(`   Users with first_name: ${stats[0].with_first_name}`);
    console.log(`   Users with last_name: ${stats[0].with_last_name}`);
    
    // Close database connection
    await dbHelpers.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    await dbHelpers.close();
    process.exit(1);
  }
}

splitFullName();

