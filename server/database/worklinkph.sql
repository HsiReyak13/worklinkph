CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_provider VARCHAR(50) DEFAULT 'email',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  city VARCHAR(100),
  province VARCHAR(100),
  identity VARCHAR(100),
  skills TEXT,
  job_preferences JSONB DEFAULT '{}'::jsonb,
  accessibility_settings JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  oauth_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'full-time',
  tags JSONB DEFAULT '[]'::jsonb,
  posted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  link VARCHAR(1024),
  contact_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || company || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources USING gin(to_tsvector('english', title || ' ' || organization || ' ' || description));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = auth_user_id);

CREATE POLICY "Jobs are publicly readable" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = jobs.posted_by 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = jobs.posted_by 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Resources are publicly readable" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update resources" ON resources
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete resources" ON resources
  FOR DELETE USING (auth.role() = 'authenticated');

INSERT INTO jobs (title, company, location, description, type, tags) VALUES
('Customer Service Representative', 'TeleCare Solutions', 'Makati City', 'Remote position ideal for individuals with mobility challenges. Flexible hours and comprehensive training provided.', 'remote', '["Full-time", "PWDs", "Senior Citizens"]'::jsonb),
('Administrative Assistant', 'Inclusive Workspace Inc.', 'Quezon City', 'Entry-level position with mentorship program. Accessible office with accommodations for various disabilities.', 'office', '["Part-time", "PWDs", "Youth"]'::jsonb),
('Data Entry Specialist', 'Digital Solutions PH', 'Taguig City', 'Work remotely with flexible hours. Training provided for all technical skills required.', 'remote', '["Work from Home", "PWDs", "Senior Citizens", "Rural Communities"]'::jsonb),
('Community Coordinator', 'Bayanihan Foundation', 'Cebu City', 'Engage with local communities to develop sustainable livelihood programs. Transportation allowance provided.', 'field', '["Full-time", "Youth", "Indigenous Peoples"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO resources (title, organization, category, description, type) VALUES
('PWD Employment Rights Guide', 'Department of Labor and Employment', 'Legal Resources', 'Comprehensive guide on employment rights and benefits for Persons with Disabilities in the Philippines.', 'legal'),
('Senior Citizen Job Training', 'National Council of Senior Citizens', 'Training', 'Free digital skills training programs designed specifically for senior citizens seeking employment.', 'training'),
('Youth Entrepreneurship Program', 'Department of Trade and Industry', 'Entrepreneurship', 'Funding and mentorship opportunities for young entrepreneurs from marginalized communities.', 'entrepreneurship'),
('Rural Employment Initiative', 'Department of Agriculture', 'Employment Programs', 'Agricultural employment programs specifically designed for rural communities and indigenous peoples.', 'employment'),
('Accessibility Tools for PWDs', 'National Council on Disability Affairs', 'Accessibility', 'Free resources and tools to help PWDs navigate digital platforms and job applications.', 'accessibility')
ON CONFLICT DO NOTHING;
