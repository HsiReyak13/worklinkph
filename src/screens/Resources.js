import React, { useState } from 'react';
import { FiMenu, FiSearch } from 'react-icons/fi';
import './Resources.css';
import Sidebar from '../components/Sidebar';

const Resources = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resources = [
    {
      id: 1,
      title: 'PWD Employment Rights Guide',
      organization: 'Department of Labor and Employment',
      category: 'Legal Resources',
      description: 'Comprehensive guide on employment rights and benefits for Persons with Disabilities in the Philippines.',
      type: 'legal'
    },
    {
      id: 2,
      title: 'Senior Citizen Job Training',
      organization: 'National Council of Senior Citizens',
      category: 'Training',
      description: 'Free digital skills training programs designed specifically for senior citizens seeking employment.',
      type: 'training'
    },
    {
      id: 3,
      title: 'Youth Entrepreneurship Program',
      organization: 'Department of Trade and Industry',
      category: 'Entrepreneurship',
      description: 'Funding and mentorship opportunities for young entrepreneurs from marginalized communities.',
      type: 'entrepreneurship'
    },
    {
      id: 4,
      title: 'Rural Employment Initiative',
      organization: 'Department of Agriculture',
      category: 'Employment Programs',
      description: 'Agricultural employment programs specifically designed for rural communities and indigenous peoples.',
      type: 'employment'
    },
    {
      id: 5,
      title: 'Accessibility Tools for PWDs',
      organization: 'National Council on Disability Affairs',
      category: 'Accessibility',
      description: 'Free resources and tools to help PWDs navigate digital platforms and job applications.',
      type: 'accessibility'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Resources' },
    { id: 'training', label: 'Training' },
    { id: 'legal', label: 'Legal Resources' }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || resource.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleMoreInfo = (resourceId) => {
    console.log('More info for resource:', resourceId);
    // In a real app, this would show detailed information
  };

  const handleVisit = (resourceId) => {
    console.log('Visit resource:', resourceId);
    // In a real app, this would open external link
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="resources">
      {/* Header */}
      <header className="resources-header">
        <h1 className="header-title" onClick={() => onNavigate('home')}>WorkLink PH</h1>
        <button className="menu-button" onClick={toggleSidebar} aria-label="Open menu">
          <FiMenu size={24} />
        </button>
      </header>

      {/* Title */}
      <div className="resources-title-section">
        <h2>Employment Resources Directory</h2>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for resources..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs-section">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Count */}
      <div className="resources-info">
        <span className="resource-count">{filteredResources.length} resources found</span>
      </div>

      {/* Resource Listings */}
      <div className="resources-list">
        {filteredResources.map(resource => (
          <div key={resource.id} className="resource-card">
            <div className="resource-header">
              <h3 className="resource-title">{resource.title}</h3>
              <div className="resource-meta">
                <span className="resource-organization">{resource.organization}</span>
                <span className={`resource-category ${resource.type}`}>{resource.category}</span>
              </div>
            </div>
            
            <p className="resource-description">{resource.description}</p>
            
            <div className="resource-actions">
              <button 
                className="more-info-button"
                onClick={() => handleMoreInfo(resource.id)}
              >
                More Info
              </button>
              <button 
                className="visit-button"
                onClick={() => handleVisit(resource.id)}
              >
                Visit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="no-resources">
          <div className="empty-icon">📚</div>
          <h3>No resources found</h3>
          <p>We couldn't find any resources matching your search. Try different keywords or browse all categories.</p>
          <button className="empty-action-button" onClick={() => {setSearchTerm(''); setActiveTab('all');}}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onNavigate={onNavigate}
        currentScreen="resources"
      />
    </div>
  );
};

export default Resources;
