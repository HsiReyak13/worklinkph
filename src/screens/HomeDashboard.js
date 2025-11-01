import React, { useState } from 'react';
import { FiMenu, FiPhone, FiMail } from 'react-icons/fi';
import { MdShare } from 'react-icons/md';
import './HomeDashboard.css';
import Sidebar from '../components/Sidebar';

const HomeDashboard = ({ onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFindJobs = () => {
    onNavigate('findjobs');
  };

  const handleResources = () => {
    onNavigate('resources');
  };

  const handleProfile = () => {
    onNavigate('profile');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="home-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="header-title" onClick={() => onNavigate('home')}>WorkLink PH</h1>
        <button className="menu-button" onClick={toggleSidebar} aria-label="Open menu">
          <FiMenu size={24} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">WorkLink PH</h2>
          <p className="hero-subtitle">Inclusive Employment & Empowerment</p>
          <p className="hero-description">
            Connecting PWDs, Senior Citizens, Youth, and Marginalized Groups to Opportunities
          </p>
          <div className="hero-buttons">
            <button className="hero-button primary" onClick={handleFindJobs}>
              Find Jobs
            </button>
            <button className="hero-button secondary" onClick={handleResources}>
              Resources
            </button>
          </div>
        </div>
      </section>

      {/* How WorkLink Helps Section */}
      <section className="features-section">
        <h3>How WorkLink PH Helps You</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h4>Inclusive Job Matching</h4>
            <p>Find employment opportunities tailored to your specific needs and abilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h4>Resource Directory</h4>
            <p>Access a comprehensive list of services and support organizations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h4>Personalized Experience</h4>
            <p>Customize your profile to receive recommendations that match your preferences.</p>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="beneficiaries-section">
        <h3>Who We Serve</h3>
        <div className="beneficiaries-grid">
          <div className="beneficiary-card">
            <h4>Persons with Disabilities</h4>
            <p>Accessible job listings with employers committed to inclusive workplaces.</p>
          </div>
          <div className="beneficiary-card">
            <h4>Senior Citizens</h4>
            <p>Flexible and part-time work opportunities suited to experience and lifestyle.</p>
          </div>
          <div className="beneficiary-card">
            <h4>Youth</h4>
            <p>Entry-level positions, internships, and training programs to build career paths.</p>
          </div>
          <div className="beneficiary-card">
            <h4>Marginalized Groups</h4>
            <p>Sustainable job opportunities and resources for underserved communities.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h3>Start Your Journey Today</h3>
        <p>Create your profile and discover opportunities tailored for you</p>
        <button className="cta-button" onClick={handleProfile}>
          Create Profile
        </button>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <h4>WorkLink PH</h4>
          <p>Inclusive Employment & Empowerment</p>
          <div className="footer-links">
            <button className="footer-link-btn" aria-label="Call us">
              <FiPhone size={20} />
            </button>
            <button className="footer-link-btn" aria-label="Email us">
              <FiMail size={20} />
            </button>
            <button className="footer-link-btn" aria-label="Share app">
              <MdShare size={20} />
            </button>
          </div>
          <p className="footer-love">Made with <span aria-label="love">❤️</span> for inclusivity</p>
        </div>
      </footer>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onNavigate={onNavigate}
        currentScreen="home"
      />
    </div>
  );
};

export default HomeDashboard;
