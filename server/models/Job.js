const { dbHelpers } = require('../config/database');

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

    const sql = `
      INSERT INTO jobs (
        title, company, location, description, type, tags, posted_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const tagsJson = JSON.stringify(tags);

    const result = await dbHelpers.run(sql, [
      title,
      company,
      location,
      description,
      type || 'full-time',
      tagsJson,
      posted_by
    ]);

    return this.findById(result.lastID);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM jobs WHERE id = ?';
    const job = await dbHelpers.get(sql, [id]);
    return job ? this.parseJob(job) : null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (title LIKE ? OR company LIKE ? OR location LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.location) {
      sql += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      // SQLite JSON search for tags
      const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      filters.tags.forEach(tag => params.push(`%"${tag}"%`));
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT ${parseInt(filters.limit)}`;
    }

    if (filters.offset) {
      sql += ` OFFSET ${parseInt(filters.offset)}`;
    }

    const jobs = await dbHelpers.all(sql, params);
    return jobs.map(job => this.parseJob(job));
  }

  static async update(id, updateData) {
    const allowedFields = ['title', 'company', 'location', 'description', 'type', 'tags'];

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        if (key === 'tags') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(id);

    const sql = `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`;
    await dbHelpers.run(sql, values);

    return this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM jobs WHERE id = ?';
    await dbHelpers.run(sql, [id]);
    return true;
  }

  static parseJob(job) {
    if (job.tags) {
      try {
        job.tags = typeof job.tags === 'string' ? JSON.parse(job.tags) : job.tags;
      } catch (e) {
        job.tags = [];
      }
    }
    return job;
  }
}

module.exports = Job;

