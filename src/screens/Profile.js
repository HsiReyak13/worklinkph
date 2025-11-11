import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiArrowRight, FiCheckCircle, FiAlertCircle, FiCamera } from 'react-icons/fi';
import './Profile.css';
import Sidebar from '../components/Sidebar';
import { userAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Avatar from '../components/Avatar';
import { supabase } from '../config/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';

const Profile = ({ onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { preferences: accessibilityPrefs, updatePreference, getText } = useAccessibility();
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    identity: '',
    skills: '',
    avatarUrl: null,
    jobPreferences: {
      fullTime: false,
      partTime: false,
      remote: false,
      flexible: false
    },
    accessibility: {
      screenReader: false,
      highContrast: false,
      largeText: false
    },
    notifications: {
      email: true,
      sms: false,
      inApp: true
    }
  });

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getProfile();
        if (response.success && response.data) {
          const user = response.data.user || response.data;
          const fullName = user.fullName || 
            (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '') ||
            user.full_name || '';
          const userAccessibility = user.accessibility || user.accessibility_settings || {};
          setProfileData(prev => ({
            ...prev,
            fullName,
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            province: user.province || '',
            identity: user.identity || '',
            skills: user.skills || '',
            avatarUrl: user.avatar_url || user.avatarUrl || null,
            onboardingProgress: user.onboarding_progress || user.onboardingProgress || {},
            jobPreferences: user.jobPreferences || user.job_preferences || prev.jobPreferences,
            accessibility: {
              screenReader: userAccessibility.screenReader || false,
              highContrast: userAccessibility.highContrast || false,
              largeText: userAccessibility.largeText || false
            },
            notifications: user.notifications || user.notification_preferences || prev.notifications
          }));
          
          // Sync with accessibility context
          if (userAccessibility.largeText !== undefined) {
            updatePreference('largeText', userAccessibility.largeText);
          }
          if (userAccessibility.highContrast !== undefined) {
            updatePreference('highContrast', userAccessibility.highContrast);
          }
          if (userAccessibility.screenReader !== undefined) {
            updatePreference('screenReader', userAccessibility.screenReader);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().split(/\s+/).length < 2) {
          errors.fullName = 'Please enter both first and last name';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !/^09\d{9}$/.test(value)) {
          errors.phone = 'Please enter a valid Philippine phone number (09XXXXXXXXX)';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    
    // Clear success state when user makes changes
    if (success) {
      setSuccess(false);
    }
    
    // Special handling for phone number - only allow digits and limit to 11 characters
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      setProfileData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
      
      // Validate phone
      if (phoneValue) {
        const errors = validateField('phone', phoneValue);
        if (errors.phone) {
          setValidationErrors(prev => ({ ...prev, ...errors }));
        }
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
      
      // Sync accessibility preferences with context
      if (parent === 'accessibility' && type === 'checkbox') {
        updatePreference(child, checked);
      }
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Validate field on change
      if (type !== 'checkbox') {
        const errors = validateField(name, value);
        if (Object.keys(errors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...errors }));
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const errors = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  const handleSaveProfile = async () => {
    // Validate all fields
    const errors = {};
    if (!profileData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileData.email && !emailRegex.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone if provided
    if (profileData.phone && !/^09\d{9}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid Philippine phone number (09XXXXXXXXX)';
    }
    
    setValidationErrors(errors);
    setTouched({
      fullName: true,
      email: true,
      phone: true
    });
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the validation errors before saving');
      return;
    }
    
    // Optimistic UI update - show success immediately
    const previousProfileData = { ...profileData };
    setSuccess(true);
    setSaving(true);
    toast.success('Saving profile...');
    
    try {
      // Split full name into first and last name
      const nameParts = profileData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const updateData = {
        firstName,
        lastName,
        email: profileData.email,
        phone: profileData.phone || null,
        city: profileData.city || null,
        province: profileData.province || null,
        identity: profileData.identity || null,
        skills: profileData.skills || null,
        jobPreferences: profileData.jobPreferences,
        accessibility: {
          screenReader: accessibilityPrefs.screenReader || profileData.accessibility.screenReader,
          highContrast: accessibilityPrefs.highContrast || profileData.accessibility.highContrast,
          largeText: accessibilityPrefs.largeText || profileData.accessibility.largeText
        },
        notifications: profileData.notifications
      };
      
      const response = await userAPI.updateProfile(updateData);
      
      if (response.success) {
        // Update with server response if it includes additional data
        if (response.data?.user) {
          const user = response.data.user;
          setProfileData(prev => ({
            ...prev,
            avatarUrl: user.avatar_url || user.avatarUrl || prev.avatarUrl
          }));
        }
        toast.success('Profile saved successfully!');
        // Clear success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Rollback on error
        setProfileData(previousProfileData);
        setSuccess(false);
        toast.error(response.message || 'Failed to save profile');
      }
    } catch (err) {
      // Rollback on error
      setProfileData(previousProfileData);
      setSuccess(false);
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    console.log('Signing out');
    onNavigate('login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use a different approach
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Avatar storage not configured. Please contact support.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save URL to database
      const response = await userAPI.uploadAvatar(publicUrl);
      
      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: publicUrl
        }));
        toast.success('Profile picture updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to save avatar URL');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error(err.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="profile">
      {/* Header */}
      <header className="profile-header">
        <h1 className="header-title" onClick={() => onNavigate('home')}>WorkLink PH</h1>
        <button className="menu-button" onClick={toggleSidebar} aria-label="Open menu">
          <FiMenu size={24} />
        </button>
      </header>

      {/* Profile Header Section */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="avatar-upload-container">
            <Avatar
              src={profileData.avatarUrl}
              name={profileData.fullName}
              className="profile-avatar"
              size={100}
            />
            <button
              className="avatar-upload-button"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              aria-label="Upload profile picture"
              title="Upload profile picture"
            >
              {uploadingAvatar ? (
                <div className="avatar-upload-spinner"></div>
              ) : (
                <FiCamera size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
              aria-label="Profile picture file input"
            />
          </div>
          <h2>{getText('My Profile')}</h2>
          <p>{getText('Customize your experience')}</p>
        </div>
      </section>

      {/* Personal Information */}
      <section className="profile-section">
        <h3>{getText('Personal Information')}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">{getText('Full Name')}</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={getText('Enter your full name')}
                className={
                  touched.fullName && validationErrors.fullName
                    ? 'input-error'
                    : touched.fullName && !validationErrors.fullName && profileData.fullName
                    ? 'input-success'
                    : ''
                }
              />
              {touched.fullName && validationErrors.fullName && (
                <span className="error-icon" title={validationErrors.fullName}>
                  <FiAlertCircle />
                </span>
              )}
              {touched.fullName && !validationErrors.fullName && profileData.fullName && (
                <span className="success-icon" title="Valid">
                  <FiCheckCircle />
                </span>
              )}
            </div>
            {touched.fullName && validationErrors.fullName && (
              <span className="error-message">{validationErrors.fullName}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">{getText('Email Address')}</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={getText('Enter your email')}
                className={
                  touched.email && validationErrors.email
                    ? 'input-error'
                    : touched.email && !validationErrors.email && profileData.email
                    ? 'input-success'
                    : ''
                }
              />
              {touched.email && validationErrors.email && (
                <span className="error-icon" title={validationErrors.email}>
                  <FiAlertCircle />
                </span>
              )}
              {touched.email && !validationErrors.email && profileData.email && (
                <span className="success-icon" title="Valid">
                  <FiCheckCircle />
                </span>
              )}
            </div>
            {touched.email && validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">{getText('Phone Number')}</label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="09XXXXXXXXX"
                maxLength="11"
                pattern="09[0-9]{9}"
                className={
                  touched.phone && validationErrors.phone
                    ? 'input-error'
                    : touched.phone && !validationErrors.phone && profileData.phone
                    ? 'input-success'
                    : ''
                }
              />
              {touched.phone && validationErrors.phone && (
                <span className="error-icon" title={validationErrors.phone}>
                  <FiAlertCircle />
                </span>
              )}
              {touched.phone && !validationErrors.phone && profileData.phone && (
                <span className="success-icon" title="Valid">
                  <FiCheckCircle />
                </span>
              )}
            </div>
            {touched.phone && validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="city">{getText('Location (City)')}</label>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.city}
              onChange={handleInputChange}
              placeholder={getText('Enter your city')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="province">{getText('Province')}</label>
            <input
              type="text"
              id="province"
              name="province"
              value={profileData.province}
              onChange={handleInputChange}
              placeholder={getText('Enter your province')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="identity">{getText('I identify as:')}</label>
            <select
              id="identity"
              name="identity"
              value={profileData.identity}
              onChange={handleInputChange}
            >
              <option value="">Select an option</option>
              <option value="pwd">Person with Disability</option>
              <option value="senior">Senior Citizen</option>
              <option value="youth">Youth</option>
              <option value="marginalized">Marginalized Group</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </section>

      {/* Skills & Experience */}
      <section className="profile-section">
        <h3>{getText('Skills & Experience')}</h3>
        <div className="form-group">
          <label htmlFor="skills">{getText('List your skills and previous work experience')}</label>
          <textarea
            id="skills"
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            placeholder={getText('Describe your skills, work experience, and qualifications...')}
            rows="4"
          />
        </div>
      </section>

      {/* Job Preferences */}
      <section className="profile-section">
        <h3>{getText('Job Preferences')}</h3>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.fullTime"
              checked={profileData.jobPreferences.fullTime}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Full-time employment
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.partTime"
              checked={profileData.jobPreferences.partTime}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Part-time employment
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.remote"
              checked={profileData.jobPreferences.remote}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Remote / Work from home
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.flexible"
              checked={profileData.jobPreferences.flexible}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Flexible hours
          </label>
        </div>
      </section>

      {/* Accessibility Settings */}
      <section className="profile-section">
        <h3>{getText('Accessibility Settings')}</h3>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.screenReader"
              checked={profileData.accessibility.screenReader}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            I use a screen reader
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.highContrast"
              checked={profileData.accessibility.highContrast}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Enable high contrast mode
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.largeText"
              checked={profileData.accessibility.largeText}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Use larger text size
          </label>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="profile-section">
        <h3>{getText('Notification Preferences')}</h3>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.email"
              checked={profileData.notifications.email}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Email notifications
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.sms"
              checked={profileData.notifications.sms}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            SMS notifications
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.inApp"
              checked={profileData.notifications.inApp}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            In-app notifications
          </label>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="profile-actions">
        <button 
          className={`save-button ${success ? 'success' : ''} ${saving ? 'saving' : ''}`}
          onClick={handleSaveProfile}
          disabled={saving || loading}
        >
          {saving ? 'Saving...' : success ? 'Saved!' : getText('Save Profile')}
        </button>
        <button className="signout-button" onClick={handleSignOut}>
          <span>{getText('Sign Out')}</span>
          <FiArrowRight size={18} />
        </button>
      </section>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onNavigate={onNavigate}
        currentScreen="profile"
      />
    </div>
  );
};

export default Profile;
