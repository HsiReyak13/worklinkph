const { supabase } = require('../config/database');

class User {
  static async create(userData) {
    const {
      authUserId,
      authProvider = 'email',
      firstName,
      lastName,
      email,
      phone,
      city,
      province,
      identity,
      skills,
      jobPreferences = {},
      accessibility = {},
      notifications = {},
      onboardingCompleted = false,
      oauthMetadata = {},
      avatarUrl = null,
      onboardingProgress = {}
    } = userData;

    const fullName = `${firstName} ${lastName}`.trim();

    const existingProfile = await this.findByAuthUserId(authUserId);
    if (existingProfile) {
      throw new Error('User profile already exists');
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    if (phone) {
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingPhone) {
        throw new Error('Phone already registered');
      }
    }

    const userDataToStore = {
      auth_user_id: authUserId,
      auth_provider: authProvider,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      city: city || null,
      province: province || null,
      identity: identity || null,
      skills: skills || null,
      job_preferences: jobPreferences,
      accessibility_settings: accessibility,
      notification_preferences: notifications,
      onboarding_completed: onboardingCompleted,
      oauth_metadata: oauthMetadata,
      avatar_url: avatarUrl || null,
      onboarding_progress: onboardingProgress
    };

    const { data, error } = await supabase
      .from('users')
      .insert(userDataToStore)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.sanitizeUser(data);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.sanitizeUser(data);
  }

  static async findByAuthUserId(authUserId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) return null;
    return this.sanitizeUser(data);
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.sanitizeUser(data);
  }

  static async findByEmailOrPhone(identifier) {
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return this.findByEmail(identifier);
    } else {
      const phone = identifier.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !data) return null;
      return this.sanitizeUser(data);
    }
  }

  static async update(id, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'city', 'province',
      'identity', 'skills', 'job_preferences',
      'accessibility_settings', 'notification_preferences',
      'onboarding_completed', 'avatar_url', 'onboarding_progress'
    ];

    const updates = {};
    let hasFirstNameUpdate = false;
    let hasLastNameUpdate = false;
    let newFirstName = null;
    let newLastName = null;

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      if (allowedFields.includes(dbKey)) {
        if (dbKey === 'job_preferences' || dbKey === 'accessibility_settings' || dbKey === 'notification_preferences') {
          updates[dbKey] = value;
        } else if (dbKey === 'onboarding_completed') {
          updates[dbKey] = value;
        } else {
          updates[dbKey] = value;
          
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

    if (hasFirstNameUpdate || hasLastNameUpdate) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', id)
        .single();
      
      if (currentUser) {
        const firstName = hasFirstNameUpdate ? newFirstName : currentUser.first_name;
        const lastName = hasLastNameUpdate ? newLastName : currentUser.last_name;
        updates.full_name = `${firstName} ${lastName}`.trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data ? this.sanitizeUser(data) : null;
  }

  static sanitizeUser(user) {
    const {
      password_hash,
      password,
      ...sanitized
    } = user;

    if (sanitized.onboarding_completed !== undefined) {
      sanitized.onboarding_completed = sanitized.onboarding_completed === true || sanitized.onboarding_completed === 1;
    }

    if (sanitized.created_at && sanitized.created_at instanceof Date) {
      sanitized.created_at = sanitized.created_at.toISOString();
    }
    if (sanitized.updated_at && sanitized.updated_at instanceof Date) {
      sanitized.updated_at = sanitized.updated_at.toISOString();
    }

    return sanitized;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }
}

module.exports = User;
