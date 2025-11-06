import React, { useState, useMemo } from 'react';
import './App.css';

// Import screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeDashboard from './screens/HomeDashboard';
import FindJobs from './screens/FindJobs';
import Profile from './screens/Profile';
import Resources from './screens/Resources';
import OnboardingScreen from './screens/OnboardingScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasCompletedOnboarding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('onboardingCompleted') || 'false');
    } catch (_) {
      return false;
    }
  }, [currentScreen]);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (hasCompletedOnboarding) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('onboarding');
    }
  };

  const handleSignUp = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('onboardingCompleted', 'false');
    } catch (_) {}
    setCurrentScreen('onboarding');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('onboardingCompleted', 'true');
    } catch (_) {}
    setCurrentScreen('home');
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
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
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
