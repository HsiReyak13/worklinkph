const { dbHelpers } = require('../config/database');

async function addOnboardingColumn() {
  try {
    console.log('Adding onboarding_completed column to users table...');
    
    // Check if column already exists by trying to add it
    // SQLite doesn't support "IF NOT EXISTS" for ALTER TABLE
    // So we'll wrap it in a try-catch
    const sql = `
      ALTER TABLE users 
      ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
    `;
    
    try {
      await dbHelpers.run(sql);
      console.log('✅ onboarding_completed column added successfully!');
    } catch (error) {
      if (error.message.includes('duplicate column')) {
        console.log('ℹ️  onboarding_completed column already exists');
      } else {
        throw error;
      }
    }
    
    // Close database connection
    await dbHelpers.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding onboarding_completed column:', error);
    await dbHelpers.close();
    process.exit(1);
  }
}

addOnboardingColumn();

