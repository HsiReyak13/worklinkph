import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiArrowRight, FiCheckCircle, FiAlertCircle, FiCamera, FiInfo } from 'react-icons/fi';
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
          errors.fullName = 'Full name is required. Please enter your first and last name.';
        } else if (value.trim().split(/\s+/).length < 2) {
          errors.fullName = 'Please enter both your first and last name (e.g., "Juan Dela Cruz").';
        } else if (value.trim().length < 3) {
          errors.fullName = 'Name is too short. Please enter your complete name.';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required. We need this to contact you about job opportunities.';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address (e.g., "juan@example.com"). Make sure it includes @ and a domain.';
        } else if (value.includes(' ')) {
          errors.email = 'Email cannot contain spaces. Please remove any spaces.';
        }
        break;
      case 'phone':
        if (value && !/^09\d{9}$/.test(value)) {
          errors.phone = 'Please enter a valid Philippine phone number starting with 09 followed by 9 more digits (e.g., 09123456789).';
        } else if (value && value.length < 11) {
          errors.phone = 'Phone number must be 11 digits. Please enter all digits.';
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
      errors.fullName = 'Full name is required. Please enter your first and last name.';
    } else if (profileData.fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Please enter both your first and last name (e.g., "Juan Dela Cruz").';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required. We need this to contact you about job opportunities.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.email = 'Please enter a valid email address (e.g., "juan@example.com"). Make sure it includes @ and a domain.';
      } else if (profileData.email.includes(' ')) {
        errors.email = 'Email cannot contain spaces. Please remove any spaces.';
      }
    }
    
    // Validate phone if provided
    if (profileData.phone && !/^09\d{9}$/.test(profileData.phone)) {
      if (profileData.phone.length < 11) {
        errors.phone = 'Phone number must be 11 digits. Please enter all digits (e.g., 09123456789).';
      } else {
        errors.phone = 'Please enter a valid Philippine phone number starting with 09 followed by 9 more digits (e.g., 09123456789).';
      }
    }
    
    setValidationErrors(errors);
    setTouched({
      fullName: true,
      email: true,
      phone: true
    });
    
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      const fieldNames = Object.keys(errors).map(key => {
        const fieldMap = { fullName: 'Full Name', email: 'Email', phone: 'Phone Number' };
        return fieldMap[key] || key;
      }).join(', ');
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in: ${fieldNames}`);
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
        const errorMsg = response.message || 'Failed to save profile';
        toast.error(`${errorMsg}. Please check your connection and try again. If the problem persists, contact support.`);
      }
    } catch (err) {
      // Rollback on error
      setProfileData(previousProfileData);
      setSuccess(false);
      console.error('Error saving profile:', err);
      let errorMessage = 'Failed to save profile. ';
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message?.includes('timeout')) {
        errorMessage += 'The request took too long. Please try again.';
      } else {
        errorMessage += 'Please try again. If the problem persists, contact support.';
      }
      toast.error(errorMessage);
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error(`Please select a valid image file (JPG, PNG, GIF, or WebP). File type: ${file.type || 'unknown'}`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Image size is ${fileSizeMB}MB. Please select an image smaller than 5MB. You can compress the image or choose a different file.`);
      return;
    }

    setUploadingAvatar(true);
    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Not authenticated. Please sign in again.');
      }

      const userId = session.user.id;

      // Delete old avatar if it exists
      const oldAvatarUrl = profileData.avatarUrl;
      if (oldAvatarUrl && (oldAvatarUrl.includes('/avatars/') || oldAvatarUrl.includes('storage/v1/object/public/avatars/'))) {
        try {
          // Extract filename from old URL (handles different URL formats)
          let oldFileName = oldAvatarUrl;
          if (oldAvatarUrl.includes('/avatars/')) {
            oldFileName = oldAvatarUrl.split('/avatars/').pop();
          } else if (oldAvatarUrl.includes('avatars/')) {
            oldFileName = oldAvatarUrl.split('avatars/').pop();
          }
          
          // Remove query parameters if present
          oldFileName = oldFileName.split('?')[0].split('#')[0];
          
          // Only delete if filename starts with user ID (security check)
          if (oldFileName && oldFileName.startsWith(userId)) {
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([oldFileName]);
            
            if (deleteError) {
              console.warn('Failed to delete old avatar:', deleteError);
              // Don't throw - continue with upload even if deletion fails
            } else {
              console.log('Old avatar deleted successfully:', oldFileName);
            }
          }
        } catch (deleteErr) {
          console.warn('Error deleting old avatar:', deleteErr);
          // Continue with upload
        }
      }

      // Create a unique filename
      const fileExt = fileExtension || file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      let fileName = `${userId}-${timestamp}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || `image/${fileExt}`
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', {
          error: uploadError,
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          errorCode: uploadError.error,
          fileName: fileName,
          fileSize: file.size,
          fileType: file.type,
          userId: userId
        });
        
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error('Avatar storage bucket not configured. Please contact support.');
        } else if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('RLS') || uploadError.message?.includes('permission')) {
          throw new Error('Permission denied. Storage bucket policies need to be configured. Please run the setup_storage_bucket.sql script in Supabase.');
        } else if (uploadError.message?.includes('duplicate') || uploadError.message?.includes('already exists')) {
          // If file exists, try with a new timestamp
          fileName = `${userId}-${timestamp + 1}.${fileExt}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || `image/${fileExt}`
            });
          
          if (retryError) {
            throw retryError;
          }
        } else if (uploadError.statusCode === 413 || uploadError.message?.includes('too large')) {
          throw new Error('File is too large. Please select an image under 5MB.');
        } else {
          throw uploadError;
        }
      }

      // Get public URL with cache busting
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache busting query parameter to force refresh
      const publicUrlWithCache = `${publicUrl}?t=${timestamp}`;

      // Verify the URL is accessible
      try {
        const img = new Image();
        img.onerror = () => {
          console.warn('Avatar URL might not be accessible yet:', publicUrlWithCache);
        };
        img.src = publicUrlWithCache;
      } catch (imgErr) {
        console.warn('Error verifying avatar URL:', imgErr);
      }

      // Save URL to database
      const response = await userAPI.uploadAvatar(publicUrlWithCache);
      
      if (response.success) {
        // Update local state with new avatar URL
        setProfileData(prev => ({
          ...prev,
          avatarUrl: publicUrlWithCache
        }));
        toast.success('Profile picture updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to save avatar URL to database');
      }
    } catch (err) {
      console.error('Error uploading avatar:', {
        error: err,
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      let errorMessage = 'Failed to upload profile picture. ';
      
      if (err.message?.includes('Bucket not found') || err.message?.includes('storage not configured') || err.message?.includes('bucket not configured')) {
        errorMessage += 'Avatar storage is not available. Please contact support.';
      } else if (err.message?.includes('Permission denied') || err.message?.includes('RLS') || err.message?.includes('row-level security') || err.message?.includes('permission')) {
        errorMessage += 'Permission denied. Please run the setup_storage_bucket.sql script in Supabase SQL Editor to configure storage permissions.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection and try again.';
      } else if (err.message?.includes('Not authenticated') || err.message?.includes('session')) {
        errorMessage += 'Your session has expired. Please sign in again.';
      } else if (err.message?.includes('too large') || err.message?.includes('413')) {
        errorMessage += err.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again with a different image. Make sure the file is a valid image (JPG, PNG, or GIF) under 5MB.';
      }
      
      toast.error(errorMessage);
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
            <span className="help-text">Enter your first and last name as it appears on official documents</span>
            <div className="input-wrapper">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., Juan Dela Cruz"
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
            <span className="help-text">We'll use this to send you job opportunities and important updates</span>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., juan.delacruz@email.com"
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
            <span className="help-text">Optional. Enter your 11-digit Philippine mobile number starting with 09</span>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g., 09123456789"
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
            <span className="help-text">Optional. Your city helps us find local job opportunities</span>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.city}
              onChange={handleInputChange}
              placeholder="e.g., Manila, Quezon City, Cebu"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="province">{getText('Province')}</label>
            <span className="help-text">Optional. Your province helps us match you with regional opportunities</span>
            <input
              type="text"
              id="province"
              name="province"
              value={profileData.province}
              onChange={handleInputChange}
              placeholder="e.g., Metro Manila, Cebu, Laguna"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="identity">{getText('I identify as:')}</label>
            <span className="help-text">Optional. This helps us connect you with relevant programs and opportunities</span>
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
          <span className="help-text">Include your relevant skills, work history, education, and certifications. This helps employers find you.</span>
          <textarea
            id="skills"
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            placeholder="e.g., Customer service (3 years), Microsoft Office, Basic computer skills, High school graduate..."
            rows="4"
          />
        </div>
      </section>

      {/* Job Preferences */}
      <section className="profile-section">
        <h3>{getText('Job Preferences')}</h3>
        <p className="section-help-text">Select all that apply. We'll match you with jobs that fit your preferences.</p>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.fullTime"
              checked={profileData.jobPreferences.fullTime}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Full-time employment</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.partTime"
              checked={profileData.jobPreferences.partTime}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Part-time employment</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.remote"
              checked={profileData.jobPreferences.remote}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Remote / Work from home</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="jobPreferences.flexible"
              checked={profileData.jobPreferences.flexible}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Flexible hours</span>
          </label>
        </div>
      </section>

      {/* Accessibility Settings */}
      <section className="profile-section">
        <h3>{getText('Accessibility Settings')}</h3>
        <p className="section-help-text">Customize the interface to make it easier to use. Changes apply immediately.</p>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.screenReader"
              checked={profileData.accessibility.screenReader}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">I use a screen reader</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="Screen reader information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">Optimizes the interface for screen reader software like NVDA, JAWS, or VoiceOver. Improves navigation and announces important information.</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.highContrast"
              checked={profileData.accessibility.highContrast}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Enable high contrast mode</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="High contrast mode information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">Increases contrast between text and backgrounds for better visibility. Uses black backgrounds with white text and stronger borders.</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accessibility.largeText"
              checked={profileData.accessibility.largeText}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Use larger text size</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="Large text mode information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">Increases font sizes throughout the interface by approximately 20% for easier reading. Helpful for users with visual impairments.</span>
            </div>
          </label>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="profile-section">
        <h3>{getText('Notification Preferences')}</h3>
        <p className="section-help-text">Choose how you want to receive updates about job opportunities and important information.</p>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.email"
              checked={profileData.notifications.email}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">Email notifications</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="Email notifications information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">Receive job alerts, application updates, and important messages via email.</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.sms"
              checked={profileData.notifications.sms}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">SMS notifications</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="SMS notifications information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">Get urgent updates and reminders via text message. Requires a valid phone number.</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="notifications.inApp"
              checked={profileData.notifications.inApp}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">In-app notifications</span>
            <div className="tooltip-wrapper">
              <FiInfo className="tooltip-icon" aria-label="In-app notifications information" role="button" tabIndex={0} />
              <span className="tooltip-text" role="tooltip" aria-live="polite">See notifications when you're using the app. These appear as badges and alerts within the interface.</span>
            </div>
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
