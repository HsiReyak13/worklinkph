import React from 'react';
import { FiHome, FiBriefcase, FiFileText, FiUser } from 'react-icons/fi';
import './BottomNavigation.css';

const BottomNavigation = ({ currentScreen, onNavigate, isLoggedIn }) => {
  // Don't show bottom nav on auth screens or splash
  const hiddenScreens = ['splash', 'login', 'signup', 'onboarding', 'auth/callback'];
  if (hiddenScreens.includes(currentScreen) || !isLoggedIn) {
    return null;
  }

  const menuItems = [
    { 
      id: 'home', 
      label: 'Home',
      icon: <FiHome size={20} />
    },
    { 
      id: 'findjobs', 
      label: 'Jobs',
      icon: <FiBriefcase size={20} />
    },
    { 
      id: 'resources', 
      label: 'Resources',
      icon: <FiFileText size={20} />
    },
    { 
      id: 'profile', 
      label: 'Profile',
      icon: <FiUser size={20} />
    }
  ];

  const handleItemClick = (screenId) => {
    if (screenId !== currentScreen) {
      onNavigate(screenId);
    }
  };

  return (
    <nav className="bottom-navigation" role="navigation" aria-label="Main navigation">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${currentScreen === item.id ? 'active' : ''}`}
          onClick={() => handleItemClick(item.id)}
          aria-label={item.label}
          aria-current={currentScreen === item.id ? 'page' : undefined}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;

