-- ============================================
-- WorkLink PH Database Schema
-- MySQL/MariaDB for XAMPP
-- ============================================

-- Create database (uncomment if needed)
CREATE DATABASE IF NOT EXISTS worklinkph CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worklinkph;

-- ============================================
-- DROP TABLES (if you need to reset)
-- ============================================
-- DROP TABLE IF EXISTS jobs;
-- DROP TABLE IF EXISTS resources;
-- DROP TABLE IF EXISTS users;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  identity VARCHAR(100),
  skills TEXT,
  job_preferences TEXT,
  accessibility_settings TEXT,
  notification_preferences TEXT,
  onboarding_completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'full-time',
  tags TEXT,
  posted_by INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_user FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  link VARCHAR(1024),
  contact_info TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_category ON resources(category);

-- ============================================
-- SAMPLE DATA (SEED)
-- ============================================

-- Sample Jobs
INSERT INTO jobs (title, company, location, description, type, tags) VALUES
('Customer Service Representative', 'TeleCare Solutions', 'Makati City', 'Remote position ideal for individuals with mobility challenges. Flexible hours and comprehensive training provided.', 'remote', '["Full-time", "PWDs", "Senior Citizens"]'),
('Administrative Assistant', 'Inclusive Workspace Inc.', 'Quezon City', 'Entry-level position with mentorship program. Accessible office with accommodations for various disabilities.', 'office', '["Part-time", "PWDs", "Youth"]'),
('Data Entry Specialist', 'Digital Solutions PH', 'Taguig City', 'Work remotely with flexible hours. Training provided for all technical skills required.', 'remote', '["Work from Home", "PWDs", "Senior Citizens", "Rural Communities"]'),
('Community Coordinator', 'Bayanihan Foundation', 'Cebu City', 'Engage with local communities to develop sustainable livelihood programs. Transportation allowance provided.', 'field', '["Full-time", "Youth", "Indigenous Peoples"]');

-- Sample Resources
INSERT INTO resources (title, organization, category, description, type) VALUES
('PWD Employment Rights Guide', 'Department of Labor and Employment', 'Legal Resources', 'Comprehensive guide on employment rights and benefits for Persons with Disabilities in the Philippines.', 'legal'),
('Senior Citizen Job Training', 'National Council of Senior Citizens', 'Training', 'Free digital skills training programs designed specifically for senior citizens seeking employment.', 'training'),
('Youth Entrepreneurship Program', 'Department of Trade and Industry', 'Entrepreneurship', 'Funding and mentorship opportunities for young entrepreneurs from marginalized communities.', 'entrepreneurship'),
('Rural Employment Initiative', 'Department of Agriculture', 'Employment Programs', 'Agricultural employment programs specifically designed for rural communities and indigenous peoples.', 'employment'),
('Accessibility Tools for PWDs', 'National Council on Disability Affairs', 'Accessibility', 'Free resources and tools to help PWDs navigate digital platforms and job applications.', 'accessibility');

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all users
-- SELECT * FROM users;

-- View all jobs
-- SELECT * FROM jobs;

-- View all resources
-- SELECT * FROM resources;

-- Count records
-- SELECT 
--   (SELECT COUNT(*) FROM users) AS total_users,
--   (SELECT COUNT(*) FROM jobs) AS total_jobs,
--   (SELECT COUNT(*) FROM resources) AS total_resources;

-- Search jobs by location
-- SELECT * FROM jobs WHERE location LIKE '%Makati%';

-- Search jobs by type
-- SELECT * FROM jobs WHERE type = 'remote';

-- Get jobs with user information (if posted_by is set)
-- SELECT j.*, u.first_name, u.last_name, u.email 
-- FROM jobs j 
-- LEFT JOIN users u ON j.posted_by = u.id;

-- ============================================
-- END OF SQL FILE
-- ============================================

