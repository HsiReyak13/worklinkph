import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { authAPI } from '../services/api';
import './AuthCallback.css';

const AuthCallback = ({ onSuccess, onNavigate }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a bit for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session from URL hash (Supabase OAuth callback)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session && session.user) {
          // Check/create user profile
          try {
            const response = await authAPI.handleAuthCallback();
            
            if (response.success) {
              // Clear URL hash and redirect
              window.history.replaceState({}, document.title, '/');
              
              if (onSuccess) {
                onSuccess();
              }
            } else {
              setError('Failed to complete authentication');
            }
          } catch (err) {
            console.error('Callback error:', err);
            // If profile creation fails, still allow login
            if (err.message && err.message.includes('profile')) {
              // Profile doesn't exist, but auth succeeded
              window.history.replaceState({}, document.title, '/');
              if (onSuccess) {
                onSuccess();
              }
            } else {
              setError(err.message || 'Failed to complete authentication');
            }
          }
        } else {
          // Try to get session from URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            // Session is in URL, wait a bit more for Supabase to process
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: { session: newSession } } = await supabase.auth.getSession();
            
            if (newSession && newSession.user) {
              const response = await authAPI.handleAuthCallback();
              if (response.success) {
                window.history.replaceState({}, document.title, '/');
                if (onSuccess) {
                  onSuccess();
                }
                return;
              }
            }
          }
          
          setError('No session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [onSuccess]);

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-content">
          <div className="loading-spinner"></div>
          <p>Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-content">
          <div className="error-icon">⚠️</div>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => onNavigate && onNavigate('login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

