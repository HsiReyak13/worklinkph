import React from 'react';
import ProgressiveImage from './ProgressiveImage';
import { FiUser } from 'react-icons/fi';
import './Avatar.css';

/**
 * Avatar component with initials fallback
 * @param {string} src - The image source URL
 * @param {string} name - Full name to generate initials from
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {number} size - Size of the avatar in pixels (default: 80)
 */
const Avatar = ({ 
  src, 
  name = '', 
  className = '', 
  style = {},
  size = 80
}) => {
  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName || !fullName.trim()) {
      return '';
    }
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    
    if (parts.length === 1) {
      // Single name - take first 2 characters
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    // Multiple names - take first letter of first and last name
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const initials = getInitials(name);
  const hasInitials = initials.length > 0;

  // Fallback content - show initials if available, otherwise show icon
  const fallback = hasInitials ? (
    <div className="avatar-initials" style={{ fontSize: `${size * 0.4}px` }}>
      {initials}
    </div>
  ) : (
    <FiUser size={size * 0.5} />
  );

  return (
    <ProgressiveImage
      src={src}
      alt={name ? `${name}'s avatar` : 'Avatar'}
      className={`avatar ${className}`}
      fallback={fallback}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        ...style 
      }}
    />
  );
};

export default Avatar;

