const Job = require('../models/Job');
const Resource = require('../models/Resource');
const { dbHelpers } = require('../config/database');

const sampleJobs = [
  {
    title: 'Customer Service Representative',
    company: 'TeleCare Solutions',
    location: 'Makati City',
    description: 'Remote position ideal for individuals with mobility challenges. Flexible hours and comprehensive training provided.',
    type: 'remote',
    tags: ['Full-time', 'PWDs', 'Senior Citizens']
  },
  {
    title: 'Administrative Assistant',
    company: 'Inclusive Workspace Inc.',
    location: 'Quezon City',
    description: 'Entry-level position with mentorship program. Accessible office with accommodations for various disabilities.',
    type: 'office',
    tags: ['Part-time', 'PWDs', 'Youth']
  },
  {
    title: 'Data Entry Specialist',
    company: 'Digital Solutions PH',
    location: 'Taguig City',
    description: 'Work remotely with flexible hours. Training provided for all technical skills required.',
    type: 'remote',
    tags: ['Work from Home', 'PWDs', 'Senior Citizens', 'Rural Communities']
  },
  {
    title: 'Community Coordinator',
    company: 'Bayanihan Foundation',
    location: 'Cebu City',
    description: 'Engage with local communities to develop sustainable livelihood programs. Transportation allowance provided.',
    type: 'field',
    tags: ['Full-time', 'Youth', 'Indigenous Peoples']
  }
];

const sampleResources = [
  {
    title: 'PWD Employment Rights Guide',
    organization: 'Department of Labor and Employment',
    category: 'Legal Resources',
    description: 'Comprehensive guide on employment rights and benefits for Persons with Disabilities in the Philippines.',
    type: 'legal'
  },
  {
    title: 'Senior Citizen Job Training',
    organization: 'National Council of Senior Citizens',
    category: 'Training',
    description: 'Free digital skills training programs designed specifically for senior citizens seeking employment.',
    type: 'training'
  },
  {
    title: 'Youth Entrepreneurship Program',
    organization: 'Department of Trade and Industry',
    category: 'Entrepreneurship',
    description: 'Funding and mentorship opportunities for young entrepreneurs from marginalized communities.',
    type: 'entrepreneurship'
  },
  {
    title: 'Rural Employment Initiative',
    organization: 'Department of Agriculture',
    category: 'Employment Programs',
    description: 'Agricultural employment programs specifically designed for rural communities and indigenous peoples.',
    type: 'employment'
  },
  {
    title: 'Accessibility Tools for PWDs',
    organization: 'National Council on Disability Affairs',
    category: 'Accessibility',
    description: 'Free resources and tools to help PWDs navigate digital platforms and job applications.',
    type: 'accessibility'
  }
];

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Check if data already exists
    const existingJobs = await Job.findAll({ limit: 1 });
    if (existingJobs.length > 0) {
      console.log('Database already has data. Skipping seed.');
      await dbHelpers.close();
      process.exit(0);
    }
    
    // Seed jobs
    console.log('Adding sample jobs...');
    for (const job of sampleJobs) {
      await Job.create(job);
    }
    console.log(`✓ Added ${sampleJobs.length} jobs`);
    
    // Seed resources
    console.log('Adding sample resources...');
    for (const resource of sampleResources) {
      await Resource.create(resource);
    }
    console.log(`✓ Added ${sampleResources.length} resources`);
    
    console.log('Database seeding completed successfully!');
    
    // Close database connection
    await dbHelpers.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await dbHelpers.close();
    process.exit(1);
  }
}

seedDatabase();

