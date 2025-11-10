import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationContext = createContext(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

// Screen metadata for breadcrumbs
const screenMetadata = {
  home: { label: 'Home', screen: 'home' },
  findjobs: { label: 'Jobs', screen: 'findjobs' },
  resources: { label: 'Resources', screen: 'resources' },
  profile: { label: 'Profile', screen: 'profile' },
  login: { label: 'Login', screen: 'login' },
  signup: { label: 'Sign Up', screen: 'signup' },
};

// Helper to get breadcrumb items for a screen
export const getBreadcrumbs = (currentScreen, additionalItems = []) => {
  const breadcrumbs = [];
  
  // Always start with Home for main screens
  if (['home', 'findjobs', 'resources', 'profile'].includes(currentScreen)) {
    breadcrumbs.push(screenMetadata.home);
    
    // Add current screen if it's not home
    if (currentScreen !== 'home' && screenMetadata[currentScreen]) {
      breadcrumbs.push(screenMetadata[currentScreen]);
    }
  } else if (screenMetadata[currentScreen]) {
    // For other screens, just show the screen itself
    breadcrumbs.push(screenMetadata[currentScreen]);
  }
  
  // Add any additional items (e.g., job details, resource details)
  if (additionalItems && additionalItems.length > 0) {
    breadcrumbs.push(...additionalItems);
  }
  
  return breadcrumbs;
};

export const NavigationProvider = ({ children }) => {
  // Start with splash screen - let App.js handle restoration
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Save navigation state to localStorage (only for logged-in screens)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Only save state for main app screens, not auth screens
    const loggedInScreens = ['home', 'findjobs', 'resources', 'profile'];
    if (loggedInScreens.includes(currentScreen)) {
      try {
        const state = {
          currentScreen,
          history: navigationHistory,
          timestamp: Date.now()
        };
        localStorage.setItem('navigationState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving navigation state:', error);
      }
    }
  }, [currentScreen, navigationHistory, isInitialized]);

  // Update breadcrumbs when screen changes (reset to base level)
  useEffect(() => {
    const breadcrumbs = getBreadcrumbs(currentScreen);
    setBreadcrumbItems(breadcrumbs);
  }, [currentScreen]);

  const navigate = useCallback((screen, options = {}) => {
    // Don't add to history if it's the same screen
    if (screen === currentScreen && !options.force) {
      return;
    }

    const previousScreen = currentScreen;
    setCurrentScreen(screen);
    setIsInitialized(true);
    
    // Only add to history if it's a logged-in screen and we're not forcing
    const loggedInScreens = ['home', 'findjobs', 'resources', 'profile'];
    if (!options.force && loggedInScreens.includes(previousScreen) && loggedInScreens.includes(screen)) {
      setNavigationHistory(prev => {
        // Don't add if previous screen is the same
        if (prev.length > 0 && prev[prev.length - 1] === screen) {
          return prev;
        }
        const newHistory = [...prev, previousScreen].slice(-10);
        return newHistory;
      });
    }

    // Update breadcrumbs with any additional items
    if (options.breadcrumbItems) {
      const breadcrumbs = getBreadcrumbs(screen, options.breadcrumbItems);
      setBreadcrumbItems(breadcrumbs);
    }
  }, [currentScreen]);

  const updateBreadcrumbs = useCallback((items) => {
    const breadcrumbs = getBreadcrumbs(currentScreen, items);
    setBreadcrumbItems(breadcrumbs);
  }, [currentScreen]);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previousScreen);
    }
  }, [navigationHistory]);

  const clearNavigationState = useCallback(() => {
    setCurrentScreen('splash');
    setNavigationHistory([]);
    setBreadcrumbItems([]);
    setIsInitialized(false);
    try {
      localStorage.removeItem('navigationState');
    } catch (error) {
      console.error('Error clearing navigation state:', error);
    }
  }, []);

  // Method to restore state from localStorage (called by App.js after checking auth)
  const restoreState = useCallback((screen, history = []) => {
    setCurrentScreen(screen);
    setNavigationHistory(history);
    setIsInitialized(true);
  }, []);

  const value = {
    currentScreen,
    navigate,
    goBack,
    navigationHistory,
    breadcrumbItems,
    updateBreadcrumbs,
    clearNavigationState,
    restoreState,
    canGoBack: navigationHistory.length > 0
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;

