import React from 'react';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items, onNavigate }) => {
  // Don't show breadcrumbs if there's only one item or no items
  if (!items || items.length <= 1) {
    return null;
  }

  const handleBreadcrumbClick = (item, index) => {
    // Don't navigate if it's the last item (current page)
    if (index < items.length - 1 && item.screen) {
      onNavigate(item.screen);
    }
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && item.screen;

          return (
            <li key={index} className="breadcrumb-item">
              {isClickable ? (
                <button
                  className="breadcrumb-link"
                  onClick={() => handleBreadcrumbClick(item, index)}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {index === 0 && <FiHome size={14} />}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {index === 0 && <FiHome size={14} />}
                  <span>{item.label}</span>
                </span>
              )}
              {!isLast && (
                <FiChevronRight 
                  size={14} 
                  className="breadcrumb-separator" 
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

