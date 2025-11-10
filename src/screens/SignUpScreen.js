import React, { useState } from 'react';
import './SignUpScreen.css';
import { authAPI } from '../services/api';
import { supabase } from '../config/supabase';

const SignUpScreen = ({ onNavigate, onSignUp }) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow digits and limit to 11 characters
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user types
    if (error) setError('');
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Complete signup
      setError('');
      setLoading(true);

      try {
        // Split full name into first and last name
        const nameParts = formData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (!firstName || !lastName) {
          setError('Please enter both first and last name');
          setLoading(false);
          return;
        }

        const userData = {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        const response = await authAPI.register(userData);
        
        if (response.success) {
          // Session is automatically saved by authAPI
          if (onSignUp) {
            onSignUp();
          }
        } else {
          setError(response.message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        setError(err.message || 'Registration failed. Please check your information and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      await authAPI.signInWithGoogle();
      // OAuth redirect will happen, so we don't need to handle success here
      // The callback will be handled by AuthCallback component
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#ef4444' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: '#f59e0b' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, label: 'Strong', color: '#10b981' };
    }
    return { strength: 3, label: 'Good', color: '#3b82f6' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderStep1 = () => (
    <>
      <div className="signup-header">
        <h2>Create your account</h2>
        <div className="progress-indicator">
          <span>Step 1 of 2</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleNext} className="signup-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="09XXXXXXXXX"
            maxLength="11"
            pattern="09[0-9]{9}"
            required
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="next-button" disabled={googleLoading}>
          Next
        </button>
      </form>

      <div className="google-signin-section">
        <div className="divider">
          <span>OR</span>
        </div>
        <button
          type="button"
          className="google-signin-button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="signup-header">
        <button type="button" className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <h2>Create your account</h2>
        <div className="progress-indicator">
          <span>Step 2 of 2</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleNext} className="signup-form">
        <div className="form-group">
          <label htmlFor="password">Create Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                )}
              </svg>
            </button>
          </div>
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${(passwordStrength.strength / 4) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                ></div>
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {showConfirmPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                )}
              </svg>
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="password-mismatch">
              Passwords do not match
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="next-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </>
  );

  return (
    <div className="signup-screen">
      <div className="signup-content">
        {step === 1 ? renderStep1() : renderStep2()}
        
        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="login-link"
              onClick={() => onNavigate('login')}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
