import React, { useState, useEffect } from 'react';
import { FiMenu, FiSearch, FiChevronUp, FiChevronDown, FiInfo, FiExternalLink, FiPhone, FiCheck, FiFileText, FiBriefcase, FiArrowRight, FiX } from 'react-icons/fi';
import './Resources.css';
import Sidebar from '../components/Sidebar';
import { resourcesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { ResourceCardSkeleton, SkeletonList } from '../components/SkeletonLoader';

const Resources = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    organization: [],
    category: []
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Fallback data in case API fails
  const fallbackResources = [
    {
      id: 1,
      title: 'PWD Employment Rights Guide',
      organization: 'Department of Labor and Employment',
      category: 'Legal Resources',
      description: 'Comprehensive guide on employment rights and benefits for Persons with Disabilities in the Philippines.',
      type: 'legal',
      details: {
        contact: 'Email: dole@dole.gov.ph | Phone: (02) 8527-3000',
        eligibility: 'Persons with Disabilities (PWDs) registered with local PWD offices',
        requirements: 'PWD ID, medical certificate, employment certificate',
        benefits: '20% discount on basic necessities, tax incentives for employers, accessibility accommodations',
        howToApply: 'Visit nearest DOLE office or apply online at www.dole.gov.ph'
      },
      website: 'https://www.dole.gov.ph'
    },
    {
      id: 2,
      title: 'Senior Citizen Job Training Program',
      organization: 'Technical Education and Skills Development Authority',
      category: 'Training',
      description: 'Free skills training programs designed specifically for senior citizens seeking employment opportunities.',
      type: 'training',
      details: {
        contact: 'Email: info@tesda.gov.ph | Phone: (02) 8887-7777',
        eligibility: 'Filipino senior citizens (60 years and above)',
        requirements: 'Senior Citizen ID, valid ID, accomplished application form',
        benefits: 'Free training, certification, job placement assistance, transportation allowance',
        howToApply: 'Register at nearest TESDA office or online at www.tesda.gov.ph'
      },
      website: 'https://www.tesda.gov.ph'
    },
    {
      id: 3,
      title: 'Youth Job Placement Service',
      organization: 'Public Employment Service Office',
      category: 'Employment Programs',
      description: 'Free job matching and placement services for Filipino youth seeking employment opportunities.',
      type: 'employment',
      details: {
        contact: 'Contact your local PESO office | Visit: www.peso.gov.ph',
        eligibility: 'Filipino youth aged 18-30 years',
        requirements: 'Valid ID, resume, educational certificates',
        benefits: 'Free job matching, career counseling, skills assessment, interview preparation',
        howToApply: 'Register at your local PESO office or online through WorkLink PH platform'
      },
      website: 'https://www.peso.gov.ph'
    },
    {
      id: 4,
      title: 'Rural Employment Initiative',
      organization: 'Department of Labor and Employment',
      category: 'Employment Programs',
      description: 'Employment programs specifically designed for rural communities and indigenous peoples.',
      type: 'employment',
      details: {
        contact: 'Email: ruraljobs@dole.gov.ph | Phone: (02) 8527-3000',
        eligibility: 'Residents of rural areas and indigenous communities',
        requirements: 'Residency certificate, valid ID, basic education certificate',
        benefits: 'Stable employment, skills training, transportation support, housing assistance',
        howToApply: 'Contact local DOLE office or barangay hall for application forms'
      },
      website: 'https://www.dole.gov.ph'
    },
    {
      id: 5,
      title: 'Accessibility Tools for PWD Job Seekers',
      organization: 'National Council on Disability Affairs',
      category: 'Accessibility',
      description: 'Free resources and tools to help PWDs navigate digital platforms and job applications.',
      type: 'accessibility',
      details: {
        contact: 'Email: info@ncda.gov.ph | Phone: (02) 8923-1031',
        eligibility: 'Registered PWDs seeking employment',
        requirements: 'PWD ID, proof of disability, application form',
        benefits: 'Free assistive technology, software licenses, training on digital job tools',
        howToApply: 'Download application form from www.ncda.gov.ph and submit to regional office'
      },
      website: 'https://www.ncda.gov.ph'
    },
    {
      id: 6,
      title: 'TESDA Skills Training Program',
      organization: 'Technical Education and Skills Development Authority',
      category: 'Training',
      description: 'Free technical and vocational training programs for all Filipinos including PWDs, seniors, and marginalized groups.',
      type: 'training',
      details: {
        contact: 'Email: info@tesda.gov.ph | Phone: (02) 8887-7777',
        eligibility: 'Filipino citizens 15 years and above',
        requirements: 'Valid ID, latest 2x2 photo, accomplished application form',
        benefits: 'Free training, assessment, certification, toolkits, job matching',
        howToApply: 'Register at nearest TESDA office or online at www.tesda.gov.ph'
      },
      website: 'https://www.tesda.gov.ph'
    },
    {
      id: 7,
      title: 'PWD Job Placement Assistance',
      organization: 'Department of Labor and Employment',
      category: 'Employment Programs',
      description: 'Specialized job placement services for Persons with Disabilities connecting them with inclusive employers.',
      type: 'employment',
      details: {
        contact: 'Email: pwdjobs@dole.gov.ph | Phone: (02) 8527-3000',
        eligibility: 'Registered PWDs seeking employment',
        requirements: 'PWD ID, resume, skills assessment, employment certificate',
        benefits: 'Job matching with inclusive employers, workplace accommodation support, training',
        howToApply: 'Register at DOLE regional office or through WorkLink PH platform'
      },
      website: 'https://www.dole.gov.ph'
    },
    {
      id: 8,
      title: 'Senior Citizen Employment Rights',
      organization: 'Department of Labor and Employment',
      category: 'Legal Resources',
      description: 'Guide on employment rights, benefits, and protections for senior citizens in the workplace.',
      type: 'legal',
      details: {
        contact: 'Email: dole@dole.gov.ph | Phone: (02) 8527-3000',
        eligibility: 'Filipino senior citizens (60 years and above)',
        requirements: 'Senior Citizen ID, employment records',
        benefits: '20% discount, protection from discrimination, flexible work arrangements',
        howToApply: 'Visit nearest DOLE office or access online resources at www.dole.gov.ph'
      },
      website: 'https://www.dole.gov.ph'
    },
    {
      id: 9,
      title: 'Remote Work Training for Seniors',
      organization: 'Technical Education and Skills Development Authority',
      category: 'Training',
      description: 'Digital skills and remote work training programs designed for senior citizens seeking flexible employment.',
      type: 'training',
      details: {
        contact: 'Email: info@tesda.gov.ph | Phone: (02) 8887-7777',
        eligibility: 'Filipino senior citizens (60 years and above)',
        requirements: 'Senior Citizen ID, basic computer knowledge, internet connection',
        benefits: 'Free training, certification, job placement assistance, equipment support',
        howToApply: 'Register at TESDA office or online at www.tesda.gov.ph'
      },
      website: 'https://www.tesda.gov.ph'
    },
    {
      id: 10,
      title: 'Indigenous Peoples Employment Program',
      organization: 'Department of Labor and Employment',
      category: 'Employment Programs',
      description: 'Employment opportunities and job placement services for indigenous peoples and their communities.',
      type: 'employment',
      details: {
        contact: 'Email: ipjobs@dole.gov.ph | Phone: (02) 8527-3000',
        eligibility: 'Registered indigenous peoples seeking employment',
        requirements: 'IP certificate, valid ID, community endorsement',
        benefits: 'Job placement, skills training, cultural sensitivity training for employers',
        howToApply: 'Coordinate with DOLE regional office or tribal council'
      },
      website: 'https://www.dole.gov.ph'
    },
    {
      id: 11,
      title: 'Job Interview Skills Training',
      organization: 'Public Employment Service Office',
      category: 'Training',
      description: 'Free training on job interview skills, resume writing, and professional development for job seekers.',
      type: 'training',
      details: {
        contact: 'Contact your local PESO office | Visit: www.peso.gov.ph',
        eligibility: 'All Filipino job seekers',
        requirements: 'Valid ID, basic educational background',
        benefits: 'Free training, mock interviews, resume review, career counseling',
        howToApply: 'Register at your local PESO office or through WorkLink PH'
      },
      website: 'https://www.peso.gov.ph'
    },
    {
      id: 12,
      title: 'WorkLink PH Job Matching Service',
      organization: 'WorkLink PH',
      category: 'Employment Programs',
      description: 'Our exclusive job matching service connecting PWDs, seniors, youth, and marginalized groups with inclusive employers.',
      type: 'employment',
      details: {
        contact: 'Email: support@worklinkph.com | Phone: (02) 8888-8888',
        eligibility: 'PWDs, Senior Citizens, Youth, and Marginalized Groups',
        requirements: 'Complete profile on WorkLink PH, valid ID, skills information',
        benefits: 'Personalized job matching, application tracking, employer connections, career support',
        howToApply: 'Create your profile on WorkLink PH and browse available job opportunities'
      },
      website: 'https://www.worklinkph.com'
    }
  ];

  // Fetch resources from API on mount
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await resourcesAPI.getAll();
        if (response.success && response.data?.resources && response.data.resources.length > 0) {
          setResources(response.data.resources);
        } else {
          // Use fallback data if API returns no data
          setResources(fallbackResources);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err.message);
        // Use fallback data on error
        setResources(fallbackResources);
        toast.error('Failed to load resources. Showing cached data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleFilterOptionToggle = (filterCategory, option) => {
    setFilterOptions(prev => ({
      ...prev,
      [filterCategory]: prev[filterCategory].includes(option)
        ? prev[filterCategory].filter(f => f !== option)
        : [...prev[filterCategory], option]
    }));
  };

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const clearAllFilters = () => {
    setFilterOptions({
      organization: [],
      category: []
    });
    setSearchTerm('');
    setActiveTab('all');
  };

  // Get unique values for filter options
  const allOrganizations = [...new Set(resources.map(resource => resource.organization))];
  const allCategories = [...new Set(resources.map(resource => resource.category))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || resource.type === activeTab;
    
    const matchesOrganizationFilter = filterOptions.organization.length === 0 ||
                                     filterOptions.organization.includes(resource.organization);
    
    const matchesCategoryFilter = filterOptions.category.length === 0 ||
                                  filterOptions.category.includes(resource.category);
    
    return matchesSearch && matchesTab && matchesOrganizationFilter && matchesCategoryFilter;
  });

  const handleMoreInfo = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    setSelectedResource(resource);
  };

  const closeModal = () => {
    setSelectedResource(null);
  };

  const handleVisit = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource && resource.website) {
      window.open(resource.website, '_blank');
    }
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
          <span className="search-icon">
            <FiSearch size={20} />
          </span>
        </div>
        <button 
          className={`filter-button ${filterPanelOpen ? 'active' : ''}`}
          onClick={toggleFilterPanel}
        >
          {filterPanelOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          <span>Filter Resources</span>
        </button>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filter Resources</h3>
            <button className="clear-filters-button" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
          
          <div className="filter-groups">
            {/* Organization Filter */}
            <div className="filter-group">
              <h4>Organization</h4>
              <div className="filter-options">
                {allOrganizations.map(org => (
                  <label key={org} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterOptions.organization.includes(org)}
                      onChange={() => handleFilterOptionToggle('organization', org)}
                    />
                    <span>{org}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {allCategories.map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterOptions.category.includes(category)}
                      onChange={() => handleFilterOptionToggle('category', category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
        {loading ? (
          <SkeletonList count={3} SkeletonComponent={ResourceCardSkeleton} />
        ) : (
          filteredResources.map(resource => (
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
                  <FiInfo size={16} />
                  <span>More Info</span>
                </button>
                <button 
                  className="visit-button"
                  onClick={() => handleVisit(resource.id)}
                >
                  <span>Visit</span>
                  <FiExternalLink size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredResources.length === 0 && (
        <div className="no-resources">
          <p>No resources found matching your criteria.</p>
          <button onClick={clearAllFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* More Info Modal */}
      {selectedResource && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedResource.title}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">
                <FiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Organization</h3>
                <p>{selectedResource.organization}</p>
              </div>
              <div className="modal-section">
                <h3>Category</h3>
                <span className={`resource-category ${selectedResource.type}`}>
                  {selectedResource.category}
                </span>
              </div>
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedResource.description}</p>
              </div>
              {selectedResource.details && (
                <>
                  <div className="modal-section">
                    <h3>
                      <FiPhone size={18} />
                      <span>Contact Information</span>
                    </h3>
                    <p>{selectedResource.details.contact}</p>
                  </div>
                  <div className="modal-section">
                    <h3>
                      <FiCheck size={18} />
                      <span>Eligibility</span>
                    </h3>
                    <p>{selectedResource.details.eligibility}</p>
                  </div>
                  <div className="modal-section">
                    <h3>
                      <FiFileText size={18} />
                      <span>Requirements</span>
                    </h3>
                    <p>{selectedResource.details.requirements}</p>
                  </div>
                  <div className="modal-section">
                    <h3>
                      <FiBriefcase size={18} />
                      <span>Benefits</span>
                    </h3>
                    <p>{selectedResource.details.benefits}</p>
                  </div>
                  <div className="modal-section">
                    <h3>
                      <FiArrowRight size={18} />
                      <span>How to Apply</span>
                    </h3>
                    <p>{selectedResource.details.howToApply}</p>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="visit-button" onClick={() => handleVisit(selectedResource.id)}>
                <span>Visit Website</span>
                <FiExternalLink size={16} />
              </button>
              <button className="modal-close-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
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
