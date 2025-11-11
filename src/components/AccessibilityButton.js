import React, { useRef, useEffect } from 'react';
import { FiSettings, FiType, FiVolume2, FiVolumeX, FiGlobe, FiX } from 'react-icons/fi';
import { useAccessibility } from '../contexts/AccessibilityContext';
import textToSpeechService from '../utils/textToSpeech';
import './AccessibilityButton.css';

const AccessibilityButton = () => {
  const {
    preferences,
    togglePreference,
    isMenuOpen,
    toggleMenu,
    closeMenu,
  } = useAccessibility();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, closeMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, closeMenu]);

  const handleToggleLargeText = () => {
    togglePreference('largeText');
    if (preferences.textToSpeech) {
      textToSpeechService.speakImportant(
        preferences.largeText ? 'Large text disabled' : 'Large text enabled',
        'info'
      );
    }
  };

  const handleToggleTextToSpeech = () => {
    const newValue = !preferences.textToSpeech;
    togglePreference('textToSpeech');
    
    if (newValue) {
      // Test speech when enabling
      textToSpeechService.speakImportant('Text to speech enabled', 'success');
    } else {
      // Stop any ongoing speech when disabling
      textToSpeechService.stop();
    }
  };

  const handleToggleSimplifiedLanguage = () => {
    togglePreference('simplifiedLanguage');
    if (preferences.textToSpeech) {
      textToSpeechService.speakImportant(
        preferences.simplifiedLanguage 
          ? 'Simplified language disabled' 
          : 'Simplified language enabled',
        'info'
      );
    }
  };

  const handleReadHelp = () => {
    const helpText = `
      Accessibility features help you use this app more easily.
      Large text makes everything bigger and easier to read.
      Text to speech reads important messages out loud.
      Simplified language uses shorter, easier words.
      You can turn these features on or off anytime.
    `;
    
    if (preferences.textToSpeech) {
      textToSpeechService.speak(helpText, {
        rate: 0.9,
        volume: 1.0,
      });
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className="accessibility-button"
        onClick={toggleMenu}
        aria-label="Accessibility settings"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        title="Accessibility settings"
      >
        <FiSettings size={24} />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="accessibility-menu"
          role="menu"
          aria-label="Accessibility options"
        >
          <div className="accessibility-menu-header">
            <h3>Accessibility</h3>
            <button
              className="accessibility-menu-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="accessibility-menu-content">
            <button
              className={`accessibility-menu-item ${preferences.largeText ? 'active' : ''}`}
              onClick={handleToggleLargeText}
              role="menuitemcheckbox"
              aria-checked={preferences.largeText}
            >
              <FiType size={20} />
              <div className="menu-item-content">
                <span className="menu-item-label">Large Text</span>
                <span className="menu-item-description">
                  Make text bigger and easier to read
                </span>
              </div>
              <div className={`menu-item-toggle ${preferences.largeText ? 'on' : 'off'}`}>
                <span className="toggle-slider"></span>
              </div>
            </button>

            <button
              className={`accessibility-menu-item ${preferences.textToSpeech ? 'active' : ''}`}
              onClick={handleToggleTextToSpeech}
              role="menuitemcheckbox"
              aria-checked={preferences.textToSpeech}
            >
              {preferences.textToSpeech ? (
                <FiVolume2 size={20} />
              ) : (
                <FiVolumeX size={20} />
              )}
              <div className="menu-item-content">
                <span className="menu-item-label">Text to Speech</span>
                <span className="menu-item-description">
                  Read important messages out loud
                </span>
              </div>
              <div className={`menu-item-toggle ${preferences.textToSpeech ? 'on' : 'off'}`}>
                <span className="toggle-slider"></span>
              </div>
            </button>

            <button
              className={`accessibility-menu-item ${preferences.simplifiedLanguage ? 'active' : ''}`}
              onClick={handleToggleSimplifiedLanguage}
              role="menuitemcheckbox"
              aria-checked={preferences.simplifiedLanguage}
            >
              <FiGlobe size={20} />
              <div className="menu-item-content">
                <span className="menu-item-label">Simplified Language</span>
                <span className="menu-item-description">
                  Use shorter, easier words
                </span>
              </div>
              <div className={`menu-item-toggle ${preferences.simplifiedLanguage ? 'on' : 'off'}`}>
                <span className="toggle-slider"></span>
              </div>
            </button>

            <button
              className="accessibility-menu-item help-item"
              onClick={handleReadHelp}
              role="menuitem"
            >
              <FiSettings size={20} />
              <div className="menu-item-content">
                <span className="menu-item-label">Help & Instructions</span>
                <span className="menu-item-description">
                  Learn about accessibility features
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityButton;

