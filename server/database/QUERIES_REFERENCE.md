# WorkLink PH - SQL Queries Reference

This document contains useful SQL queries for managing your WorkLink PH database.

## Quick Setup

1. **Create Database** (if not already created):
```sql
CREATE DATABASE IF NOT EXISTS worklinkph CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worklinkph;
```

2. **Run the full schema**: Import `worklinkph.sql` in phpMyAdmin or run it via MySQL command line.

---

## Table Structure

### Users Table
- Stores user accounts with authentication and profile information
- Fields: id, first_name, last_name, email, phone, password_hash, city, province, identity, skills, job_preferences, accessibility_settings, notification_preferences, onboarding_completed, created_at, updated_at

### Jobs Table
- Stores job listings
- Fields: id, title, company, location, description, type, tags, posted_by, created_at, updated_at
- Foreign Key: posted_by → users(id)

### Resources Table
- Stores resource listings (guides, programs, etc.)
- Fields: id, title, organization, category, description, type, link, contact_info, created_at, updated_at

---

## Common Queries

### Users

**Get all users:**
```sql
SELECT * FROM users;
```

**Get user by email:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

**Get user by ID:**
```sql
SELECT * FROM users WHERE id = 1;
```

**Create a new user:**
```sql
INSERT INTO users (first_name, last_name, email, phone, password_hash, city, province)
VALUES ('John', 'Doe', 'john@example.com', '09123456789', '$2a$10$hashedpassword', 'Manila', 'Metro Manila');
```

**Update user profile:**
```sql
UPDATE users 
SET city = 'Quezon City', province = 'Metro Manila', skills = 'Customer Service, Data Entry'
WHERE id = 1;
```

**Delete a user:**
```sql
DELETE FROM users WHERE id = 1;
```

**Count total users:**
```sql
SELECT COUNT(*) AS total_users FROM users;
```

---

### Jobs

**Get all jobs:**
```sql
SELECT * FROM jobs ORDER BY created_at DESC;
```

**Get job by ID:**
```sql
SELECT * FROM jobs WHERE id = 1;
```

**Search jobs by location:**
```sql
SELECT * FROM jobs WHERE location LIKE '%Makati%';
```

**Search jobs by type:**
```sql
SELECT * FROM jobs WHERE type = 'remote';
```

**Search jobs by keyword (title, company, description):**
```sql
SELECT * FROM jobs 
WHERE title LIKE '%customer%' 
   OR company LIKE '%customer%' 
   OR description LIKE '%customer%';
```

**Get jobs posted by a specific user:**
```sql
SELECT * FROM jobs WHERE posted_by = 1;
```

**Get jobs with user information:**
```sql
SELECT j.*, u.first_name, u.last_name, u.email 
FROM jobs j 
LEFT JOIN users u ON j.posted_by = u.id;
```

**Create a new job:**
```sql
INSERT INTO jobs (title, company, location, description, type, tags, posted_by)
VALUES (
  'Software Developer',
  'Tech Company Inc.',
  'Makati City',
  'Full-stack developer position with remote options.',
  'remote',
  '["Full-time", "Remote", "Tech"]',
  1
);
```

**Update a job:**
```sql
UPDATE jobs 
SET title = 'Senior Software Developer', description = 'Updated description'
WHERE id = 1;
```

**Delete a job:**
```sql
DELETE FROM jobs WHERE id = 1;
```

**Count total jobs:**
```sql
SELECT COUNT(*) AS total_jobs FROM jobs;
```

**Get jobs by tag (JSON search):**
```sql
SELECT * FROM jobs WHERE tags LIKE '%"PWDs"%';
```

---

### Resources

**Get all resources:**
```sql
SELECT * FROM resources ORDER BY created_at DESC;
```

**Get resource by ID:**
```sql
SELECT * FROM resources WHERE id = 1;
```

**Search resources by category:**
```sql
SELECT * FROM resources WHERE category = 'Training';
```

**Search resources by type:**
```sql
SELECT * FROM resources WHERE type = 'legal';
```

**Search resources by keyword:**
```sql
SELECT * FROM resources 
WHERE title LIKE '%PWD%' 
   OR organization LIKE '%PWD%' 
   OR description LIKE '%PWD%';
```

**Create a new resource:**
```sql
INSERT INTO resources (title, organization, category, description, type, link)
VALUES (
  'Job Training Program',
  'Skills Development Authority',
  'Training',
  'Free job training for unemployed individuals.',
  'training',
  'https://example.com/training'
);
```

**Update a resource:**
```sql
UPDATE resources 
SET description = 'Updated description', link = 'https://newlink.com'
WHERE id = 1;
```

**Delete a resource:**
```sql
DELETE FROM resources WHERE id = 1;
```

**Count total resources:**
```sql
SELECT COUNT(*) AS total_resources FROM resources;
```

---

## Statistics Queries

**Get database statistics:**
```sql
SELECT 
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM jobs) AS total_jobs,
  (SELECT COUNT(*) FROM resources) AS total_resources;
```

**Get jobs by type:**
```sql
SELECT type, COUNT(*) AS count 
FROM jobs 
GROUP BY type;
```

**Get resources by category:**
```sql
SELECT category, COUNT(*) AS count 
FROM resources 
GROUP BY category;
```

**Get users by province:**
```sql
SELECT province, COUNT(*) AS count 
FROM users 
WHERE province IS NOT NULL
GROUP BY province;
```

**Get recent registrations (last 7 days):**
```sql
SELECT * FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
```

**Get recent job postings (last 7 days):**
```sql
SELECT * FROM jobs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
```

---

## Maintenance Queries

**Backup all data:**
```sql
-- Export all tables
SELECT * FROM users INTO OUTFILE '/path/to/users_backup.csv';
SELECT * FROM jobs INTO OUTFILE '/path/to/jobs_backup.csv';
SELECT * FROM resources INTO OUTFILE '/path/to/resources_backup.csv';
```

**Check table sizes:**
```sql
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'worklinkph'
ORDER BY (data_length + index_length) DESC;
```

**Optimize tables:**
```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE jobs;
OPTIMIZE TABLE resources;
```

**Check foreign key constraints:**
```sql
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'worklinkph' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## Advanced Queries

**Get users with their job postings count:**
```sql
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(j.id) AS jobs_posted
FROM users u
LEFT JOIN jobs j ON u.id = j.posted_by
GROUP BY u.id, u.first_name, u.last_name, u.email;
```

**Get most popular job locations:**
```sql
SELECT location, COUNT(*) AS job_count
FROM jobs
GROUP BY location
ORDER BY job_count DESC
LIMIT 10;
```

**Get resources by organization:**
```sql
SELECT organization, COUNT(*) AS resource_count
FROM resources
GROUP BY organization
ORDER BY resource_count DESC;
```

**Search across all tables:**
```sql
-- Search in jobs
SELECT 'job' AS type, id, title AS name, description FROM jobs 
WHERE title LIKE '%keyword%' OR description LIKE '%keyword%'

UNION ALL

-- Search in resources
SELECT 'resource' AS type, id, title AS name, description FROM resources 
WHERE title LIKE '%keyword%' OR description LIKE '%keyword%';
```

---

## Notes

- All timestamps are automatically managed by MySQL (created_at, updated_at)
- Password hashes should be generated using bcrypt (handled by the application)
- JSON fields (tags, job_preferences, etc.) are stored as TEXT in MySQL
- Foreign key constraints ensure data integrity between users and jobs

