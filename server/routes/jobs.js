const express = require('express');
const Job = require('../models/Job');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public (can be changed to Private if needed)
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      type,
      location,
      tags,
      limit,
      offset
    } = req.query;

    const filters = {
      search,
      type,
      location,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const jobs = await Job.findAll(filters);

    res.json({
      success: true,
      data: { jobs },
      count: jobs.length
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      description,
      type,
      tags
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, and description are required'
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      type,
      tags: tags || [],
      posted_by: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only allow owner or admin to update
    if (job.posted_by !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only allow owner or admin to delete
    if (job.posted_by !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.delete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

