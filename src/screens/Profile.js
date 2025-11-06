import React, { useState } from 'react';
import './Profile.css';
import Sidebar from '../components/Sidebar';

const Profile = ({ onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    identity: '',
    skills: '',
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for phone number - only allow digits and limit to 11 characters
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      setProfileData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData);
    // In a real app, this would save to backend
    alert('Profile saved successfully!');
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

  return (
    <div className="profile">
      {/* Header */}
      <header className="profile-header">
        <h1 className="header-title" onClick={() => onNavigate('home')}>WorkLink PH</h1>
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>
      </header>

      {/* Profile Header Section */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">👤</div>
          <h2>My Profile</h2>
          <p>Customize your experience</p>
        </div>
      </section>

      {/* Personal Information */}
      <section className="profile-section">
        <h3>Personal Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              placeholder="09XXXXXXXXX"
              maxLength="11"
              pattern="09[0-9]{9}"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="city">Location (City)</label>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="province">Province</label>
            <input
              type="text"
              id="province"
              name="province"
              value={profileData.province}
              onChange={handleInputChange}
              placeholder="Enter your province"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="identity">I identify as:</label>
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
        <h3>Skills & Experience</h3>
        <div className="form-group">
          <label htmlFor="skills">List your skills and previous work experience</label>
          <textarea
            id="skills"
            name="skills"
            value={profileData.skills}
            onChange={handleInputChange}
            placeholder="Describe your skills, work experience, and qualifications..."
            rows="4"
          />
        </div>
      </section>

      {/* Job Preferences */}
      <section className="profile-section">
        <h3>Job Preferences</h3>
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
        <h3>Accessibility Settings</h3>
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
        <h3>Notification Preferences</h3>
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
        <button className="save-button" onClick={handleSaveProfile}>
          Save Profile
        </button>
        <button className="signout-button" onClick={handleSignOut}>
          Sign Out →
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
