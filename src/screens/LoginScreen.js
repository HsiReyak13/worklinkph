import React, { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import './LoginScreen.css';

const LoginScreen = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Allow any input for email/phone field - validation will be handled on submit
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt:', formData);
    // Simulate API call
    setTimeout(() => {
      if (onLogin) {
        onLogin();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    console.log('Forgot password request for:', forgotEmail);
    // Simulate API call
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotPasswordStatus('success');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotPasswordStatus(null);
        setForgotEmail('');
      }, 2000);
    }, 1000);
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotPasswordStatus(null);
    setForgotEmail('');
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">WorkLink PH</h1>
          <p className="app-subtitle">Your unified Job platform</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="emailOrPhone">Email or Phone Number</label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              placeholder="Enter your email or phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
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
          </div>

          <button
            type="button"
            className="forgot-password-link"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="button-with-spinner">
                <span className="spinner-small"></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="signup-link"
              onClick={() => onNavigate('signup')}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={handleCloseForgotModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!forgotPasswordStatus && (
              <>
                <div className="modal-header">
                  <h2>Reset Password</h2>
                  <button className="modal-close" onClick={handleCloseForgotModal}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Enter your email address and we'll send you a link to reset your password.</p>
                  <form onSubmit={handleForgotPasswordSubmit}>
                    <div className="form-group">
                      <label htmlFor="forgotEmail">Email Address</label>
                      <div className="input-with-icon">
                        <FiMail className="input-icon" />
                        <input
                          type="email"
                          id="forgotEmail"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="modal-submit-btn" disabled={isForgotLoading}>
                      {isForgotLoading ? (
                        <span className="button-with-spinner">
                          <span className="spinner-small"></span>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
            {forgotPasswordStatus === 'success' && (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <h2>Email Sent!</h2>
                <p>We've sent a password reset link to your email. Please check your inbox.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
