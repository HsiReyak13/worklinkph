// Custom hook for focus trap in modals
import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a modal element
 * @param {boolean} isOpen - Whether the modal is open
 * @param {HTMLElement} elementRef - Ref to the modal container element
 */
export const useFocusTrap = (isOpen, elementRef) => {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen || !elementRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements within the modal
    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    // Handle Tab key to trap focus
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    };

    // Handle Escape key to close modal
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // This should be handled by the modal component's onClose
        // We'll just ensure focus is returned
        previousActiveElement.current?.focus();
      }
    };

    // Add event listeners
    elementRef.current.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup
    return () => {
      elementRef.current?.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Return focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, elementRef]);
};

