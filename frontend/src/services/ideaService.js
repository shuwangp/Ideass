import api from '../config/api.js';

/**
 * @typedef {Object} CreateIdeaData
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string[]} tags
 * @property {string} author
 */

/**
 * @typedef {CreateIdeaData & {id: string}} UpdateIdeaData
 */

/**
 * @typedef {Object} IdeaFilters
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} [search]
 * @property {'createdAt' | 'updatedAt'} [sortBy]
 * @property {'asc' | 'desc'} [sortOrder]
 * @property {number} [page]
 * @property {number} [limit]
 */

class IdeaService {
  /**
   * @param {IdeaFilters} [filters]
   * @returns {Promise<{ideas: import('../types/index.js').Idea[], total: number, page: number, totalPages: number}>}
   */
  async getIdeas(filters) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/ideas?${params}`);
    
    // Handle new backend response format
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for old format
    if (Array.isArray(response.data)) {
      return { ideas: response.data, total: response.data.length, page: 1, totalPages: 1 };
    }
    
    throw new Error(response.data.message || 'Failed to fetch ideas');
  }

  /**
   * @param {string} id
   * @returns {Promise<import('../types/index.js').Idea>}
   */
  async getIdeaById(id) {
    const response = await api.get(`/ideas/${id}`);
    // backend ส่ง object ตรงๆ ไม่ได้ห่อ success
    if (response.status === 200 && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch idea');
  }

  /**
   * @param {CreateIdeaData} data
   * @returns {Promise<import('../types/index.js').Idea>}
   */
  async createIdea(data) {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags
      // ไม่ต้องส่ง author เพราะ backend จะดึงจาก token
    };
    try {
      const response = await api.post('/ideas', payload);
      if (response.data.success) {
        const created = response.data.data;
        return { ...created, id: created.id || created._id };
      }
      throw new Error(response.data.message || 'Failed to create idea');
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Create Idea Error:', err.response.data);
        throw new Error(err.response.data.message || 'Failed to create idea');
      }
      throw err;
    }
  }

  /**
   * @param {UpdateIdeaData} data
   * @returns {Promise<import('../types/index.js').Idea>}
   */
  async updateIdea(data) {
    const { id, ...updateData } = data;
    try {
      const response = await api.put(`/ideas/${id}`, updateData);
      if (response.data.success) {
        const updated = response.data.data;
        return { ...updated, id: updated.id || updated._id };
      }
      throw new Error(response.data.message || 'Failed to update idea');
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Update Idea Error:', err.response.data);
        throw new Error(err.response.data.message || 'Failed to update idea');
      }
      throw err;
    }
  }

  /**
   * @param {string} id
   */
  async deleteIdea(id) {
    try {
      const response = await api.delete(`/ideas/${id}`);
      if (response.data.success) {
        return true;
      }
      throw new Error(response.data.message || 'Failed to delete idea');
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Delete Idea Error:', err.response.data);
        throw new Error(err.response.data.message || 'Failed to delete idea');
      }
      throw err;
    }
  }

  // ฟังก์ชัน AI suggestion และ search อาจต้องปรับ backend เพิ่มเติม
  /**
   * @param {string} ideaId
   * @param {'category' | 'tags' | 'development' | 'connections'} type
   */
  async generateAISuggestions(ideaId, type) {
    try {
      const response = await api.post(`/ideas/${ideaId}/ai-suggestions`, { type });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to generate AI suggestions');
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('AI Suggestion Error:', err.response.data);
        throw new Error(err.response.data.message || 'Failed to generate AI suggestions');
      }
      throw err;
    }
  }

  /**
   * @param {string} query
   * @returns {Promise<import('../types/index.js').Idea[]>}
   */
  async searchIdeas(query) {
    try {
      const response = await api.get(`/ideas/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Search failed');
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Search Ideas Error:', err.response.data);
        throw new Error(err.response.data.message || 'Search failed');
      }
      throw err;
    }
  }
}

export const ideaService = new IdeaService();