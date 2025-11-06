import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import './OnboardingScreen.css';
import { userAPI } from '../services/api';
import { logger } from '../utils/logger';

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4;

  const onboardingSteps = [
    {
      title: 'Welcome to WorkLink PH!',
      description: "Your gateway to inclusive employment opportunities in the Philippines.",
      content: (
        <div className="onboarding-content">
          <div className="onboarding-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <path d="M9 7h6M9 11h6M9 15h4"></path>
            </svg>
          </div>
          <h3>We're excited to have you on board!</h3>
          <p>WorkLink PH connects Filipinos to inclusive employment opportunities, especially for Persons with Disabilities, Senior Citizens, Youth, and Marginalized groups.</p>
        </div>
      )
    },
    {
      title: 'Find Your Perfect Job',
      description: 'Discover opportunities tailored to your skills and needs.',
      content: (
        <div className="onboarding-content">
          <div className="onboarding-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <h3>Search & Apply</h3>
          <p>Browse through a wide variety of job listings filtered by your preferences. Use search and filters to find opportunities that match your profile.</p>
          <ul className="onboarding-features">
            <li><FiCheck /> Advanced search and filtering</li>
            <li><FiCheck /> Jobs from verified employers</li>
            <li><FiCheck /> Accessibility-focused opportunities</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Access Resources',
      description: 'Connect with support organizations and services.',
      content: (
        <div className="onboarding-content">
          <div className="onboarding-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 1-3-3V7a4 4 0 0 0-4-4z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 0 3 3h7V3z"></path>
            </svg>
          </div>
          <h3>Resource Directory</h3>
          <p>Find government agencies, NGOs, training programs, and support services designed to help you succeed in your career journey.</p>
          <ul className="onboarding-features">
            <li><FiCheck /> Training programs</li>
            <li><FiCheck /> Government services</li>
            <li><FiCheck /> Community resources</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Get Started',
      description: "Let's begin your journey to finding the perfect job.",
      content: (
        <div className="onboarding-content">
          <div className="onboarding-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3>Complete Your Profile</h3>
          <p>Fill out your profile to receive personalized job recommendations. The more information you provide, the better matches we can find for you!</p>
          <ul className="onboarding-features">
            <li><FiCheck /> Add your skills and experience</li>
            <li><FiCheck /> Set your job preferences</li>
            <li><FiCheck /> Specify accessibility needs</li>
          </ul>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      await userAPI.completeOnboarding();
      logger.info('Onboarding completed successfully');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Failed to complete onboarding', error);
      // Still proceed even if API call fails
      if (onComplete) {
        onComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStepData = onboardingSteps[currentStep - 1];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              aria-valuenow={currentStep} 
              aria-valuemin={1} 
              aria-valuemax={totalSteps}
              role="progressbar"
            ></div>
          </div>
          <span className="progress-text">{currentStep} / {totalSteps}</span>
        </div>

        {/* Content */}
        <div className="onboarding-main">
          <h2 className="onboarding-title">{currentStepData.title}</h2>
          <p className="onboarding-subtitle">{currentStepData.description}</p>
          
          <div className="onboarding-content-wrapper">
            {currentStepData.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="onboarding-navigation">
          {currentStep > 1 && (
            <button 
              className="onboarding-button secondary" 
              onClick={handleBack}
              disabled={isLoading}
              aria-label="Go to previous step"
            >
              <FiArrowLeft /> Back
            </button>
          )}
          
          <div className="navigation-spacer"></div>
          
          <button 
            className="skip-button" 
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip
          </button>
          
          <button 
            className="onboarding-button primary" 
            onClick={handleNext}
            disabled={isLoading}
            aria-label={currentStep === totalSteps ? 'Complete onboarding' : 'Go to next step'}
          >
            {currentStep === totalSteps ? (
              <>
                Get Started <FiArrowRight />
              </>
            ) : (
              <>
                Next <FiArrowRight />
              </>
            )}
            {isLoading && <span className="spinner-small" aria-hidden="true"></span>}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="onboarding-dots" role="tablist">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              className={`onboarding-dot ${currentStep === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentStep(index + 1)}
              aria-label={`Go to step ${index + 1}`}
              role="tab"
              tabIndex={0}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

OnboardingScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default OnboardingScreen;

