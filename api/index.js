// Vercel Serverless Function wrapper for Express backend
const app = require('../server/server');

module.exports = (req, res) => {
  // Set Vercel environment flag
  process.env.VERCEL = '1';
  
  // Update CORS to allow Vercel frontend
  const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'https://worklinkph.vercel.app';
  
  // Handle the request
  return app(req, res);
};

