const { supabase } = require('../config/database');

class Job {
  static async create(jobData) {
    const {
      title,
      company,
      location,
      description,
      type,
      tags = [],
      posted_by = null
    } = jobData;

    const jobDataToStore = {
      title,
      company,
      location,
      description,
      type: type || 'full-time',
      tags: tags, // Supabase handles JSON/arrays natively
      posted_by: posted_by || null
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(jobDataToStore)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return this.parseJob(data);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.parseJob(data);
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from('jobs')
      .select('*');

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    // Apply limit
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }

    // Apply offset
    if (filters.offset) {
      query = query.range(
        parseInt(filters.offset),
        parseInt(filters.offset) + (parseInt(filters.limit) || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    let jobs = data || [];

    // Apply search filter (client-side for complex text search)
    // For better performance, consider using Supabase full-text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchTerm) ||
        job.company?.toLowerCase().includes(searchTerm) ||
        job.location?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      jobs = jobs.filter(job => {
        if (!job.tags || !Array.isArray(job.tags)) return false;
        return filters.tags.some(tag => job.tags.includes(tag));
      });
    }

    return jobs.map(job => this.parseJob(job));
  }

  static async update(id, updateData) {
    const allowedFields = ['title', 'company', 'location', 'description', 'type', 'tags'];

    const updates = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data ? this.parseJob(data) : null;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }

    return true;
  }

  static parseJob(job) {
    // Ensure tags is an array
    if (job.tags && !Array.isArray(job.tags)) {
      try {
        job.tags = typeof job.tags === 'string' ? JSON.parse(job.tags) : [];
      } catch (e) {
        job.tags = [];
      }
    } else if (!job.tags) {
      job.tags = [];
    }

    // Convert timestamps to ISO strings if they're Date objects
    if (job.created_at && job.created_at instanceof Date) {
      job.created_at = job.created_at.toISOString();
    }
    if (job.updated_at && job.updated_at instanceof Date) {
      job.updated_at = job.updated_at.toISOString();
    }

    return job;
  }
}

module.exports = Job;
