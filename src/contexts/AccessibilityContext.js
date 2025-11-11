import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Simplified language translations
const simplifiedTexts = {
  'Save Profile': 'Save',
  'Sign Out': 'Log Out',
  'Personal Information': 'Your Info',
  'Skills & Experience': 'Skills',
  'Job Preferences': 'Job Types',
  'Accessibility Settings': 'Accessibility',
  'Notification Preferences': 'Notifications',
  'Full Name': 'Name',
  'Email Address': 'Email',
  'Phone Number': 'Phone',
  'Location (City)': 'City',
  'I identify as:': 'I am:',
  'List your skills and previous work experience': 'Your skills and work',
  'Enter your full name': 'Type your name',
  'Enter your email': 'Type your email',
  'Enter your city': 'Type your city',
  'Enter your province': 'Type your province',
  'Describe your skills, work experience, and qualifications...': 'Tell us about your skills...',
  'My Profile': 'My Profile',
  'Customize your experience': 'Make it yours',
  'Province': 'Province',
};

const getSimplifiedText = (text, useSimplified) => {
  if (!useSimplified) return text;
  return simplifiedTexts[text] || text;
};

export const AccessibilityProvider = ({ children }) => {
  // Load preferences from localStorage
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('accessibilityPreferences');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    }
    return {
      largeText: false,
      simplifiedLanguage: false,
      textToSpeech: false,
      screenReader: false,
      highContrast: false,
    };
  };

  const [preferences, setPreferences] = useState(loadPreferences);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
    }
  }, [preferences]);

  // Apply large text class to document
  useEffect(() => {
    if (preferences.largeText) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [preferences.largeText]);

  // Apply high contrast class to document
  useEffect(() => {
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [preferences.highContrast]);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const togglePreference = useCallback((key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const getText = useCallback((text) => {
    return getSimplifiedText(text, preferences.simplifiedLanguage);
  }, [preferences.simplifiedLanguage]);

  const value = {
    preferences,
    updatePreference,
    togglePreference,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    getText,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;

