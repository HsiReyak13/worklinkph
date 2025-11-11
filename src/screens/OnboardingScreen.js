import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import './OnboardingScreen.css';
import { userAPI } from '../services/api';
import { logger } from '../utils/logger';

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    step1: {
      interests: [],
      goals: ''
    },
    step2: {
      jobTypes: [],
      workLocation: '',
      availability: ''
    },
    step3: {
      resourcesNeeded: [],
      supportServices: []
    },
    step4: {
      skills: '',
      experience: '',
      accessibilityNeeds: []
    }
  });

  const totalSteps = 4;

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          const savedProgress = user.onboarding_progress || user.onboardingProgress || {};
          if (Object.keys(savedProgress).length > 0) {
            setOnboardingData(prev => ({ ...prev, ...savedProgress }));
            // Restore step if user was in the middle
            if (savedProgress.currentStep && savedProgress.currentStep <= totalSteps) {
              setCurrentStep(savedProgress.currentStep);
            }
          }
        }
      } catch (err) {
        logger.error('Failed to load onboarding progress', err);
      }
    };
    loadProgress();
  }, []);

  // Save progress whenever data changes
  useEffect(() => {
    let isMounted = true;
    
    const saveProgress = async () => {
      if (savingProgress) return; // Prevent infinite loop
      
      setSavingProgress(true);
      try {
        await userAPI.saveOnboardingProgress({
          ...onboardingData,
          currentStep
        });
      } catch (err) {
        if (isMounted) {
          logger.error('Failed to save onboarding progress', err);
        }
      } finally {
        if (isMounted) {
          setSavingProgress(false);
        }
      }
    };

    // Debounce saves - only save after user stops typing for 1 second
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        saveProgress();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingData, currentStep]);

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
          
          <div className="onboarding-form">
            <div className="form-group">
              <label>What are you interested in? (Select all that apply)</label>
              <div className="checkbox-group">
                {['Full-time jobs', 'Part-time jobs', 'Remote work', 'Training programs', 'Career guidance'].map(interest => (
                  <label key={interest} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.step1.interests.includes(interest)}
                      onChange={(e) => {
                        const interests = e.target.checked
                          ? [...onboardingData.step1.interests, interest]
                          : onboardingData.step1.interests.filter(i => i !== interest);
                        setOnboardingData(prev => ({
                          ...prev,
                          step1: { ...prev.step1, interests }
                        }));
                      }}
                    />
                    <span className="checkmark"></span>
                    {interest}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="goals">What are your career goals?</label>
              <textarea
                id="goals"
                value={onboardingData.step1.goals}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  step1: { ...prev.step1, goals: e.target.value }
                }))}
                placeholder="Tell us about your career aspirations..."
                rows="3"
              />
            </div>
          </div>
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
          
          <div className="onboarding-form">
            <div className="form-group">
              <label>What types of jobs interest you? (Select all that apply)</label>
              <div className="checkbox-group">
                {['Customer Service', 'Administrative', 'Data Entry', 'Sales', 'Technical', 'Creative', 'Healthcare', 'Education'].map(jobType => (
                  <label key={jobType} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.step2.jobTypes.includes(jobType)}
                      onChange={(e) => {
                        const jobTypes = e.target.checked
                          ? [...onboardingData.step2.jobTypes, jobType]
                          : onboardingData.step2.jobTypes.filter(t => t !== jobType);
                        setOnboardingData(prev => ({
                          ...prev,
                          step2: { ...prev.step2, jobTypes }
                        }));
                      }}
                    />
                    <span className="checkmark"></span>
                    {jobType}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="workLocation">Preferred work location</label>
              <select
                id="workLocation"
                value={onboardingData.step2.workLocation}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  step2: { ...prev.step2, workLocation: e.target.value }
                }))}
              >
                <option value="">Select an option</option>
                <option value="remote">Remote / Work from Home</option>
                <option value="office">Office-based</option>
                <option value="hybrid">Hybrid (Remote + Office)</option>
                <option value="field">Field Work</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="availability">When are you available to start?</label>
              <select
                id="availability"
                value={onboardingData.step2.availability}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  step2: { ...prev.step2, availability: e.target.value }
                }))}
              >
                <option value="">Select an option</option>
                <option value="immediately">Immediately</option>
                <option value="1week">Within 1 week</option>
                <option value="2weeks">Within 2 weeks</option>
                <option value="1month">Within 1 month</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
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
          
          <div className="onboarding-form">
            <div className="form-group">
              <label>What resources do you need? (Select all that apply)</label>
              <div className="checkbox-group">
                {['Job training', 'Skills development', 'Career counseling', 'Financial assistance', 'Transportation support', 'Accessibility tools', 'Legal assistance', 'Healthcare services'].map(resource => (
                  <label key={resource} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.step3.resourcesNeeded.includes(resource)}
                      onChange={(e) => {
                        const resourcesNeeded = e.target.checked
                          ? [...onboardingData.step3.resourcesNeeded, resource]
                          : onboardingData.step3.resourcesNeeded.filter(r => r !== resource);
                        setOnboardingData(prev => ({
                          ...prev,
                          step3: { ...prev.step3, resourcesNeeded }
                        }));
                      }}
                    />
                    <span className="checkmark"></span>
                    {resource}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Support services you're interested in</label>
              <div className="checkbox-group">
                {['Mentorship programs', 'Peer support groups', 'Professional networking', 'Workshop events', 'Online courses'].map(service => (
                  <label key={service} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.step3.supportServices.includes(service)}
                      onChange={(e) => {
                        const supportServices = e.target.checked
                          ? [...onboardingData.step3.supportServices, service]
                          : onboardingData.step3.supportServices.filter(s => s !== service);
                        setOnboardingData(prev => ({
                          ...prev,
                          step3: { ...prev.step3, supportServices }
                        }));
                      }}
                    />
                    <span className="checkmark"></span>
                    {service}
                  </label>
                ))}
              </div>
            </div>
          </div>
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
          
          <div className="onboarding-form">
            <div className="form-group">
              <label htmlFor="skills">What skills do you have?</label>
              <textarea
                id="skills"
                value={onboardingData.step4.skills}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  step4: { ...prev.step4, skills: e.target.value }
                }))}
                placeholder="List your skills, certifications, or qualifications..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="experience">Work experience</label>
              <textarea
                id="experience"
                value={onboardingData.step4.experience}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  step4: { ...prev.step4, experience: e.target.value }
                }))}
                placeholder="Describe your previous work experience..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Accessibility needs (Select all that apply)</label>
              <div className="checkbox-group">
                {['Screen reader support', 'High contrast mode', 'Large text', 'Keyboard navigation', 'Sign language interpreter', 'Wheelchair accessible workspace', 'Flexible schedule', 'Remote work options'].map(need => (
                  <label key={need} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onboardingData.step4.accessibilityNeeds.includes(need)}
                      onChange={(e) => {
                        const accessibilityNeeds = e.target.checked
                          ? [...onboardingData.step4.accessibilityNeeds, need]
                          : onboardingData.step4.accessibilityNeeds.filter(n => n !== need);
                        setOnboardingData(prev => ({
                          ...prev,
                          step4: { ...prev.step4, accessibilityNeeds }
                        }));
                      }}
                    />
                    <span className="checkmark"></span>
                    {need}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // Save progress before moving to next step
      try {
        await userAPI.saveOnboardingProgress({
          ...onboardingData,
          currentStep: currentStep + 1
        });
      } catch (err) {
        logger.error('Failed to save progress', err);
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      // Save progress before going back
      try {
        await userAPI.saveOnboardingProgress({
          ...onboardingData,
          currentStep: currentStep - 1
        });
      } catch (err) {
        logger.error('Failed to save progress', err);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Save final progress and mark as completed
      await userAPI.saveOnboardingProgress({
        ...onboardingData,
        currentStep: totalSteps,
        completed: true
      });
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

