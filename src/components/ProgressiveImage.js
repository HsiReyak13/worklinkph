import React, { useState, useEffect } from 'react';
import './ProgressiveImage.css';

/**
 * ProgressiveImage component for loading images with a placeholder and smooth transition
 * @param {string} src - The image source URL
 * @param {string} placeholder - Optional placeholder image URL (low quality or blur)
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} fallback - Fallback content when image fails to load (e.g., icon)
 * @param {object} style - Inline styles
 */
const ProgressiveImage = ({ 
  src, 
  placeholder, 
  alt = '', 
  className = '', 
  fallback = null,
  style = {}
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when src changes
    setImageLoaded(false);
    setImageError(false);
    setIsLoading(true);
    setImageSrc(placeholder || src);

    // Create a new image object to preload
    const img = new Image();
    
    img.onload = () => {
      // Once the full image is loaded, switch to it
      setImageSrc(src);
      setImageLoaded(true);
      setIsLoading(false);
    };

    img.onerror = () => {
      setImageError(true);
      setIsLoading(false);
    };

    // Start loading the full image
    if (src) {
      img.src = src;
    } else {
      setImageError(true);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  if (imageError && fallback) {
    return (
      <div className={`progressive-image-fallback ${className}`} style={style}>
        {fallback}
      </div>
    );
  }

  return (
    <div 
      className={`progressive-image-container ${className} ${imageLoaded ? 'loaded' : ''} ${isLoading ? 'loading' : ''}`}
      style={style}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`progressive-image ${imageLoaded ? 'loaded' : 'loading'}`}
          onError={() => {
            if (!imageError) {
              setImageError(true);
              setIsLoading(false);
            }
          }}
        />
      )}
      {isLoading && !imageError && (
        <div className="progressive-image-skeleton">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;

