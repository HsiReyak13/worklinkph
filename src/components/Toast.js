import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';
import './Toast.css';
import textToSpeechService from '../utils/textToSpeech';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    // Check if text-to-speech is enabled and speak important messages
    try {
      const savedPrefs = localStorage.getItem('accessibilityPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.textToSpeech && message) {
          // Only speak error, success, and warning messages (important content)
          if (type === 'error' || type === 'success' || type === 'warning') {
            textToSpeechService.speakImportant(message, type);
          }
        }
      }
    } catch (error) {
      // Silently fail if preferences can't be read
    }

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { type, message } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiAlertCircle />;
      case 'warning':
        return <FiAlertCircle />;
      default:
        return <FiInfo />;
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <FiX />
      </button>
    </div>
  );
};

export default ToastProvider;

