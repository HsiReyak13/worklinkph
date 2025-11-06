const { dbHelpers } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      province,
      identity,
      skills,
      jobPreferences = {},
      accessibility = {},
      notifications = {},
      onboardingCompleted = false
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create full_name for backward compatibility
    const fullName = `${firstName} ${lastName}`.trim();

    const sql = `
      INSERT INTO users (
        full_name, first_name, last_name, email, phone, password_hash,
        city, province, identity, skills,
        job_preferences, accessibility_settings, notification_preferences,
        onboarding_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const preferences = JSON.stringify(jobPreferences);
    const accessibilitySettings = JSON.stringify(accessibility);
    const notificationPrefs = JSON.stringify(notifications);

    const result = await dbHelpers.run(sql, [
      fullName,
      firstName,
      lastName,
      email,
      phone,
      hashedPassword,
      city || null,
      province || null,
      identity || null,
      skills || null,
      preferences,
      accessibilitySettings,
      notificationPrefs,
      onboardingCompleted ? 1 : 0
    ]);

    return this.findById(result.lastID);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const user = await dbHelpers.get(sql, [id]);
    return user ? this.sanitizeUser(user) : null;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const user = await dbHelpers.get(sql, [email]);
    return user ? this.sanitizeUser(user) : null;
  }

  static async findByEmailOrPhone(identifier) {
    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return this.findByEmail(identifier);
    } else {
      // Find by phone (remove any non-digits first)
      const phone = identifier.replace(/\D/g, '');
      const sql = 'SELECT * FROM users WHERE phone = ?';
      const user = await dbHelpers.get(sql, [phone]);
      return user ? this.sanitizeUser(user) : null;
    }
  }

  static async update(id, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'city', 'province',
      'identity', 'skills', 'job_preferences',
      'accessibility_settings', 'notification_preferences',
      'onboarding_completed'
    ];

    const updates = [];
    const values = [];
    let hasFirstNameUpdate = false;
    let hasLastNameUpdate = false;
    let newFirstName = null;
    let newLastName = null;

    for (const [key, value] of Object.entries(updateData)) {
      // Convert camelCase to snake_case
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      if (allowedFields.includes(dbKey)) {
        if (dbKey === 'job_preferences' || dbKey === 'accessibility_settings' || dbKey === 'notification_preferences') {
          updates.push(`${dbKey} = ?`);
          values.push(JSON.stringify(value));
        } else if (dbKey === 'onboarding_completed') {
          updates.push(`${dbKey} = ?`);
          values.push(value ? 1 : 0);
        } else {
          updates.push(`${dbKey} = ?`);
          values.push(value);
          
          // Track if firstName or lastName is being updated
          if (dbKey === 'first_name') {
            hasFirstNameUpdate = true;
            newFirstName = value;
          } else if (dbKey === 'last_name') {
            hasLastNameUpdate = true;
            newLastName = value;
          }
        }
      }
    }

    // If first or last name changed, get current values and update full_name
    if (hasFirstNameUpdate || hasLastNameUpdate) {
      const currentUser = await dbHelpers.get('SELECT first_name, last_name FROM users WHERE id = ?', [id]);
      
      const firstName = hasFirstNameUpdate ? newFirstName : currentUser.first_name;
      const lastName = hasLastNameUpdate ? newLastName : currentUser.last_name;
      
      // Update full_name for backward compatibility
      const fullName = `${firstName} ${lastName}`.trim();
      updates.push(`full_name = ?`);
      values.splice(0, 0, fullName);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await dbHelpers.run(sql, values);

    return this.findById(id);
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  static sanitizeUser(user) {
    const {
      password_hash,
      password,
      ...sanitized
    } = user;

    // Parse JSON fields
    if (sanitized.job_preferences) {
      try {
        sanitized.job_preferences = typeof sanitized.job_preferences === 'string' 
          ? JSON.parse(sanitized.job_preferences) 
          : sanitized.job_preferences;
      } catch (e) {
        sanitized.job_preferences = {};
      }
    }

    if (sanitized.accessibility_settings) {
      try {
        sanitized.accessibility_settings = typeof sanitized.accessibility_settings === 'string'
          ? JSON.parse(sanitized.accessibility_settings)
          : sanitized.accessibility_settings;
      } catch (e) {
        sanitized.accessibility_settings = {};
      }
    }

    if (sanitized.notification_preferences) {
      try {
        sanitized.notification_preferences = typeof sanitized.notification_preferences === 'string'
          ? JSON.parse(sanitized.notification_preferences)
          : sanitized.notification_preferences;
      } catch (e) {
        sanitized.notification_preferences = {};
      }
    }

    // Convert onboarding_completed to boolean
    if (sanitized.onboarding_completed !== undefined) {
      sanitized.onboarding_completed = sanitized.onboarding_completed === 1 || sanitized.onboarding_completed === true;
    }

    return sanitized;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await dbHelpers.run(sql, [id]);
    return true;
  }
}

module.exports = User;

