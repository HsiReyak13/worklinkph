import React, { useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onNavigate }) => {
  useEffect(() => {
    // Auto navigate to login after 1 second
    const timer = setTimeout(() => {
      onNavigate('login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <h1 className="app-title">WorkLink PH</h1>
          <p className="app-tagline">Inclusive Employment and Empowerment</p>
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
