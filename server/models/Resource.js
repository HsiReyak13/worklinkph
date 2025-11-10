const { supabase } = require('../config/database');

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

    const resourceDataToStore = {
      title,
      organization,
      category,
      description,
      type: type || 'general',
      link: link || null,
      contact_info: contact_info || null // Supabase handles JSON natively
    };

    const { data, error } = await supabase
      .from('resources')
      .insert(resourceDataToStore)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }

    return this.parseResource(data);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.parseResource(data);
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from('resources')
      .select('*');

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.category) {
      query = query.ilike('category', `%${filters.category}%`);
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
      throw new Error(`Failed to fetch resources: ${error.message}`);
    }

    let resources = data || [];

    // Apply search filter (client-side for complex text search)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      resources = resources.filter(resource => 
        resource.title?.toLowerCase().includes(searchTerm) ||
        resource.organization?.toLowerCase().includes(searchTerm) ||
        resource.description?.toLowerCase().includes(searchTerm)
      );
    }

    return resources.map(resource => this.parseResource(resource));
  }

  static async update(id, updateData) {
    const allowedFields = [
      'title', 'organization', 'category', 'description',
      'type', 'link', 'contact_info'
    ];

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
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update resource: ${error.message}`);
    }

    return data ? this.parseResource(data) : null;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete resource: ${error.message}`);
    }

    return true;
  }

  static parseResource(resource) {
    // Parse contact_info if it's a string (shouldn't happen with Supabase, but just in case)
    if (resource.contact_info && typeof resource.contact_info === 'string') {
      try {
        resource.contact_info = JSON.parse(resource.contact_info);
      } catch (e) {
        resource.contact_info = null;
      }
    }

    // Convert timestamps to ISO strings if they're Date objects
    if (resource.created_at && resource.created_at instanceof Date) {
      resource.created_at = resource.created_at.toISOString();
    }
    if (resource.updated_at && resource.updated_at instanceof Date) {
      resource.updated_at = resource.updated_at.toISOString();
    }

    return resource;
  }
}

module.exports = Resource;
