import React, { useState, useEffect } from 'react';
import { FiMenu, FiSearch, FiChevronUp, FiChevronDown, FiMapPin, FiExternalLink, FiInbox } from 'react-icons/fi';
import './FindJobs.css';
import Sidebar from '../components/Sidebar';
import { jobsAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { JobCardSkeleton, SkeletonList } from '../components/SkeletonLoader';
import { useNavigation } from '../contexts/NavigationContext';

const FindJobs = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    jobType: [],
    location: [],
    tags: []
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const toast = useToast();
  const { updateBreadcrumbs } = useNavigation();

  // Fallback data in case API fails
  const fallbackJobs = [
    {
      id: 1,
      title: 'Customer Service Representative',
      company: 'TeleCare Solutions',
      location: 'Makati City',
      posted: '2 days ago',
      tags: ['Full-time', 'PWDs', 'Senior Citizens'],
      description: 'Remote position ideal for individuals with mobility challenges. Flexible hours and comprehensive training provided.',
      type: 'remote'
    },
    {
      id: 2,
      title: 'Administrative Assistant',
      company: 'Inclusive Workspace Inc.',
      location: 'Quezon City',
      posted: '1 week ago',
      tags: ['Part-time', 'PWDs', 'Youth'],
      description: 'Entry-level position with mentorship program. Accessible office with accommodations for various disabilities.',
      type: 'office'
    },
    {
      id: 3,
      title: 'Data Entry Specialist',
      company: 'Digital Solutions PH',
      location: 'Taguig City',
      posted: '3 days ago',
      tags: ['Work from Home', 'PWDs', 'Senior Citizens', 'Rural Communities'],
      description: 'Work remotely with flexible hours. Training provided for all technical skills required.',
      type: 'remote'
    },
    {
      id: 4,
      title: 'Community Coordinator',
      company: 'Bayanihan Foundation',
      location: 'Cebu City',
      posted: '5 days ago',
      tags: ['Full-time', 'Youth', 'Indigenous Peoples'],
      description: 'Engage with local communities to develop sustainable livelihood programs. Transportation allowance provided.',
      type: 'field'
    }
  ];

  // Fetch jobs from API on mount
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await jobsAPI.getAll();
        if (response.success && response.data?.jobs && response.data.jobs.length > 0) {
          // Transform API response to match expected format
          const transformedJobs = response.data.jobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently',
            tags: Array.isArray(job.tags) ? job.tags : (job.tags ? [job.tags] : []),
            description: job.description,
            type: job.type || 'full-time'
          }));
          setJobs(transformedJobs);
        } else {
          // Use fallback data if API returns no data
          setJobs(fallbackJobs);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
        // Use fallback data on error
        setJobs(fallbackJobs);
        toast.error('Failed to load jobs. Showing cached data.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterToggle = (filter) => {
    // Optimistic UI update - update immediately
    setFiltering(true);
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter];
      // Small delay to show visual feedback
      setTimeout(() => setFiltering(false), 100);
      return newFilters;
    });
  };

  const handleFilterOptionToggle = (filterCategory, option) => {
    // Optimistic UI update - update immediately
    setFiltering(true);
    setFilterOptions(prev => ({
      ...prev,
      [filterCategory]: prev[filterCategory].includes(option)
        ? prev[filterCategory].filter(f => f !== option)
        : [...prev[filterCategory], option]
    }));
    // Small delay to show visual feedback
    setTimeout(() => setFiltering(false), 100);
  };

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const clearAllFilters = () => {
    setFilterOptions({
      jobType: [],
      location: [],
      tags: []
    });
    setSelectedFilters([]);
    setSearchTerm('');
  };

  // Get unique values for filter options
  const allJobTypes = [...new Set(jobs.map(job => job.tags.find(tag => ['Full-time', 'Part-time', 'Work from Home'].includes(tag))).filter(Boolean))];
  const allLocations = [...new Set(jobs.map(job => job.location))];
  const allTags = [...new Set(jobs.flatMap(job => job.tags))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTagFilters = selectedFilters.length === 0 || 
                              selectedFilters.some(filter => job.tags.includes(filter));
    
    const matchesJobTypeFilter = filterOptions.jobType.length === 0 ||
                                 filterOptions.jobType.some(type => job.tags.includes(type));
    
    const matchesLocationFilter = filterOptions.location.length === 0 ||
                                  filterOptions.location.includes(job.location);
    
    const matchesTagFilter = filterOptions.tags.length === 0 ||
                             filterOptions.tags.some(tag => job.tags.includes(tag));
    
    return matchesSearch && matchesTagFilters && matchesJobTypeFilter && 
           matchesLocationFilter && matchesTagFilter;
  });

  const handleViewDetails = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      // Update breadcrumbs to show job details
      updateBreadcrumbs([
        { label: job.title, screen: null }
      ]);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const closeJobDetails = () => {
    setSelectedJob(null);
    // Reset breadcrumbs to just Jobs
    updateBreadcrumbs([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="find-jobs">
      {/* Header */}
      <header className="jobs-header">
        <h1 className="header-title" onClick={() => onNavigate('home')}>WorkLink PH</h1>
        <button className="menu-button" onClick={toggleSidebar} aria-label="Open menu">
          <FiMenu size={24} />
        </button>
      </header>

      {/* Title */}
      <div className="jobs-title-section">
        <h2>Find Inclusive Job Opportunities</h2>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search jobs, companies, or locations..."
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
          <span>Filter Jobs</span>
        </button>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filter Jobs</h3>
            <button className="clear-filters-button" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
          
          <div className="filter-groups">
            {/* Job Type Filter */}
            <div className="filter-group">
              <h4>Job Type</h4>
              <div className="filter-options">
                {allJobTypes.map(type => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterOptions.jobType.includes(type)}
                      onChange={() => handleFilterOptionToggle('jobType', type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <h4>Location</h4>
              <div className="filter-options">
                {allLocations.map(location => (
                  <label key={location} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterOptions.location.includes(location)}
                      onChange={() => handleFilterOptionToggle('location', location)}
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="filter-group">
              <h4>Tags</h4>
              <div className="filter-options">
                {allTags.map(tag => (
                  <label key={tag} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filterOptions.tags.includes(tag)}
                      onChange={() => handleFilterOptionToggle('tags', tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Count and Location */}
      <div className="jobs-info">
        <span className="job-count">{filteredJobs.length} jobs found</span>
        <span className="location">
          <FiMapPin size={16} />
          <span>Philippines</span>
        </span>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className={`jobs-list ${filtering ? 'filtering' : ''}`}>
          <SkeletonList count={5} SkeletonComponent={JobCardSkeleton} />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <FiInbox size={80} className="empty-icon" />
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button onClick={clearAllFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className={`jobs-list ${filtering ? 'filtering' : ''}`}>
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span className="job-company">{job.company}</span>
                  <span className="job-location">{job.location}</span>
                  <span className="job-posted">Posted {job.posted}</span>
                </div>
              </div>
              
              <div className="job-tags">
                {job.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`job-tag ${selectedFilters.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleFilterToggle(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="job-description">{job.description}</p>
              
              <button 
                className="view-details-button"
                onClick={() => handleViewDetails(job.id)}
              >
                <span>View Details</span>
                <FiExternalLink size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onNavigate={onNavigate}
        currentScreen="findjobs"
      />
    </div>
  );
};

export default FindJobs;
