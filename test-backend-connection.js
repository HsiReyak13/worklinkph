/**
 * Backend Connection Test Script
 * Run this to verify your backend is properly connected
 * 
 * Usage: node test-backend-connection.js
 */

require('dotenv').config({ path: './server/.env' });
const { supabase } = require('./server/config/database');

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');
  
  const results = {
    environment: {},
    database: {},
    api: {}
  };
  
  // Test 1: Environment Variables
  console.log('1️⃣  Testing Environment Variables...');
  results.environment.supabaseUrl = !!process.env.SUPABASE_URL;
  results.environment.supabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  results.environment.port = process.env.PORT || 5000;
  
  if (results.environment.supabaseUrl && results.environment.supabaseKey) {
    console.log('   ✅ SUPABASE_URL: Set');
    console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY: Set');
  } else {
    console.log('   ❌ Missing environment variables!');
    console.log('   ⚠️  Check server/.env file');
  }
  console.log('');
  
  // Test 2: Database Connection
  console.log('2️⃣  Testing Database Connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      results.database.connected = false;
      results.database.error = error.message;
      console.log('   ❌ Database connection failed');
      console.log('   Error:', error.message);
    } else {
      results.database.connected = true;
      console.log('   ✅ Database connection successful');
    }
  } catch (err) {
    results.database.connected = false;
    results.database.error = err.message;
    console.log('   ❌ Database connection error');
    console.log('   Error:', err.message);
  }
  console.log('');
  
  // Test 3: Check Database Schema
  console.log('3️⃣  Testing Database Schema...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('avatar_url, onboarding_progress')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        results.database.schema = false;
        console.log('   ❌ Missing columns: avatar_url or onboarding_progress');
        console.log('   ⚠️  Run the database migration SQL');
      } else {
        results.database.schema = 'unknown';
        console.log('   ⚠️  Could not verify schema:', error.message);
      }
    } else {
      results.database.schema = true;
      console.log('   ✅ Database schema is correct');
    }
  } catch (err) {
    results.database.schema = false;
    console.log('   ❌ Schema check failed:', err.message);
  }
  console.log('');
  
  // Test 4: Test API Endpoints (if server is running)
  console.log('4️⃣  Testing API Endpoints...');
  const fetch = require('node-fetch');
  
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      results.api.health = true;
      console.log('   ✅ Health endpoint: Working');
      console.log('   Response:', healthData.message);
    } else {
      results.api.health = false;
      console.log('   ❌ Health endpoint: Failed');
    }
  } catch (err) {
    results.api.health = false;
    console.log('   ⚠️  Health endpoint: Server not running or not accessible');
    console.log('   Error:', err.message);
  }
  
  try {
    const jobsResponse = await fetch('http://localhost:5000/api/jobs');
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      results.api.jobs = true;
      results.api.jobsCount = jobsData.data?.jobs?.length || 0;
      console.log('   ✅ Jobs endpoint: Working');
      console.log('   Jobs retrieved:', results.api.jobsCount);
    } else {
      results.api.jobs = false;
      console.log('   ❌ Jobs endpoint: Failed');
    }
  } catch (err) {
    results.api.jobs = false;
    console.log('   ⚠️  Jobs endpoint: Not accessible');
  }
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment: ${results.environment.supabaseUrl && results.environment.supabaseKey ? '✅' : '❌'}`);
  console.log(`Database: ${results.database.connected ? '✅' : '❌'}`);
  console.log(`Schema: ${results.database.schema === true ? '✅' : results.database.schema === false ? '❌' : '⚠️'}`);
  console.log(`API Health: ${results.api.health ? '✅' : '⚠️'}`);
  console.log(`API Jobs: ${results.api.jobs ? '✅' : '⚠️'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  if (results.database.connected && results.database.schema && results.api.health) {
    console.log('✅ All tests passed! Your backend is fully operational.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run tests
testBackendConnection().catch(err => {
  console.error('❌ Test script error:', err);
  process.exit(1);
});

