import React, { useState } from 'react';
import './App.css';

// Import screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeDashboard from './screens/HomeDashboard';
import FindJobs from './screens/FindJobs';
import Profile from './screens/Profile';
import Resources from './screens/Resources';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleSignUp = () => {
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNavigate={handleNavigate} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'signup':
        return <SignUpScreen onNavigate={handleNavigate} onSignUp={handleSignUp} />;
      case 'home':
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'findjobs':
        return <FindJobs onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleLogout} />;
      case 'resources':
        return <Resources onNavigate={handleNavigate} />;
      default:
        return <SplashScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
