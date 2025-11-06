import React, { useState } from 'react';
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
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
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
              🔍 Find Jobs
            </button>
            <button className="hero-button secondary" onClick={handleResources}>
              📚 Resources
            </button>
          </div>
        </div>
      </section>

      {/* How WorkLink Helps Section */}
      <section className="features-section">
        <h3>How WorkLink PH Helps You</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h4>Inclusive Job Matching</h4>
            <p>Find employment opportunities tailored to your specific needs and abilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h4>Resource Directory</h4>
            <p>Access a comprehensive list of services and support organizations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
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
            <span>📞</span>
            <span>✉️</span>
            <span>📤</span>
          </div>
          <p className="footer-love">Made with ❤️ for inclusivity</p>
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
