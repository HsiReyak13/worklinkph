const express = require('express');
const Resource = require('../models/Resource');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources with filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      limit,
      offset
    } = req.query;

    const filters = {
      search,
      type,
      category,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const resources = await Resource.findAll(filters);

    res.json({
      success: true,
      data: { resources },
      count: resources.length
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resources
// @desc    Create a new resource
// @access  Private
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      title,
      organization,
      category,
      description,
      type,
      link,
      contact_info
    } = req.body;

    if (!title || !organization || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, organization, and description are required'
      });
    }

    const resource = await Resource.create({
      title,
      organization,
      category,
      description,
      type,
      link,
      contact_info
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
// @access  Private
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const updatedResource = await Resource.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource: updatedResource }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete a resource
// @access  Private
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await Resource.delete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

