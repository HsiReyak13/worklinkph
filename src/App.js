import React, { useState, useMemo, useEffect } from 'react';
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
import AuthCallback from './screens/AuthCallback';
import { ToastProvider } from './components/Toast';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import BottomNavigation from './components/BottomNavigation';
import Breadcrumbs from './components/Breadcrumbs';

// Inner app component that uses navigation context
function AppContent() {
  const { currentScreen, navigate, breadcrumbItems, clearNavigationState, restoreState } = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const hasCompletedOnboarding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('onboardingCompleted') || 'false');
    } catch (_) {
      return false;
    }
  }, [currentScreen]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase session
        const { authAPI } = await import('./services/api');
        const authenticated = await authAPI.isAuthenticated();
        
        if (authenticated) {
          setIsLoggedIn(true);
          // Restore navigation state
          try {
            const saved = localStorage.getItem('navigationState');
            if (saved) {
              const parsed = JSON.parse(saved);
              const loggedInScreens = ['home', 'findjobs', 'resources', 'profile'];
              if (loggedInScreens.includes(parsed.currentScreen)) {
                restoreState(parsed.currentScreen, parsed.history || []);
              } else if (hasCompletedOnboarding) {
                restoreState('home', []);
              } else {
                navigate('onboarding');
              }
            } else if (hasCompletedOnboarding) {
              restoreState('home', []);
            } else {
              navigate('onboarding');
            }
          } catch (error) {
            console.error('Error restoring navigation state:', error);
            if (hasCompletedOnboarding) {
              restoreState('home', []);
            } else {
              navigate('onboarding');
            }
          }
        } else {
          setIsLoggedIn(false);
          // Check if we should show splash or go to login
          if (currentScreen === 'splash') {
            // Let splash screen handle navigation
          } else {
            navigate('login');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for OAuth callback on mount (but after auth check)
  useEffect(() => {
    if (!isCheckingAuth && (window.location.pathname === '/auth/callback' || window.location.hash.includes('access_token'))) {
      navigate('auth/callback', { force: true });
    }
  }, [navigate, isCheckingAuth]);

  const handleNavigate = (screen) => {
    navigate(screen);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (hasCompletedOnboarding) {
      navigate('home');
    } else {
      navigate('onboarding');
    }
  };

  const handleSignUp = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('onboardingCompleted', 'false');
    } catch (_) {}
    navigate('onboarding');
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      // Call logout API
      const { authAPI } = await import('./services/api');
      await authAPI.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    clearNavigationState();
    navigate('login');
  };

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('onboardingCompleted', 'true');
    } catch (_) {}
    navigate('home');
  };

  // Determine if breadcrumbs should be shown (only for logged-in main screens)
  const showBreadcrumbs = isLoggedIn && ['home', 'findjobs', 'resources', 'profile'].includes(currentScreen);

  const renderScreen = () => {
    // Check if we're on the OAuth callback route
    if (window.location.pathname === '/auth/callback' || currentScreen === 'auth/callback') {
      return (
        <AuthCallback
          onSuccess={handleLogin}
          onNavigate={handleNavigate}
        />
      );
    }

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
    <ToastProvider>
      <div className="app-shell">
        <div className="app-container">
          {showBreadcrumbs && (
            <Breadcrumbs 
              items={breadcrumbItems} 
              onNavigate={handleNavigate} 
            />
          )}
          {renderScreen()}
          <BottomNavigation 
            currentScreen={currentScreen} 
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </ToastProvider>
  );
}

// Main App component wrapped with NavigationProvider
function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;
