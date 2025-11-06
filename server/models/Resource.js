const { dbHelpers } = require('../config/database');

class Resource {
  static async create(resourceData) {
    const {
      title,
      organization,
      category,
      description,
      type,
      link = null,
      contact_info = null
    } = resourceData;

    const sql = `
      INSERT INTO resources (
        title, organization, category, description, type, link, contact_info,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const result = await dbHelpers.run(sql, [
      title,
      organization,
      category,
      description,
      type || 'general',
      link,
      contact_info ? JSON.stringify(contact_info) : null
    ]);

    return this.findById(result.lastID);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM resources WHERE id = ?';
    const resource = await dbHelpers.get(sql, [id]);
    return resource ? this.parseResource(resource) : null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (title LIKE ? OR organization LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.category) {
      sql += ' AND category LIKE ?';
      params.push(`%${filters.category}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT ${parseInt(filters.limit)}`;
    }

    if (filters.offset) {
      sql += ` OFFSET ${parseInt(filters.offset)}`;
    }

    const resources = await dbHelpers.all(sql, params);
    return resources.map(resource => this.parseResource(resource));
  }

  static async update(id, updateData) {
    const allowedFields = [
      'title', 'organization', 'category', 'description',
      'type', 'link', 'contact_info'
    ];

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        if (key === 'contact_info') {
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

    const sql = `UPDATE resources SET ${updates.join(', ')} WHERE id = ?`;
    await dbHelpers.run(sql, values);

    return this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM resources WHERE id = ?';
    await dbHelpers.run(sql, [id]);
    return true;
  }

  static parseResource(resource) {
    if (resource.contact_info) {
      try {
        resource.contact_info = typeof resource.contact_info === 'string'
          ? JSON.parse(resource.contact_info)
          : resource.contact_info;
      } catch (e) {
        resource.contact_info = null;
      }
    }
    return resource;
  }
}

module.exports = Resource;

