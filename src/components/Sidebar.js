import React from 'react';
import { FiHome, FiBriefcase, FiFileText, FiUser, FiX } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, onNavigate, currentScreen }) => {
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

  const handleMenuClick = (screenId) => {
    onNavigate(screenId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">WorkLink PH</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentScreen === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
