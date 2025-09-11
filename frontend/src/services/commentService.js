import api from '../config/api.js';

/**
 * @typedef {Object} CreateCommentData
 * @property {string} content
 * @property {string} ideaId
 */

class CommentService {
  /**
   * @param {string} ideaId
   * @returns {Promise<import('../types/index.js').Comment[]>}
   */
  async getComments(ideaId) {
    const response = await api.get(`/ideas/${ideaId}/comments`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch comments');
  }

  /**
   * @param {CreateCommentData} data
   * @returns {Promise<import('../types/index.js').Comment>}
   */
  async createComment(data) {
    const response = await api.post(`/ideas/${data.ideaId}/comments`, {
      content: data.content
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create comment');
  }

  /**
   * @param {string} commentId
   */
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete comment');
    }
  }
}

export const commentService = new CommentService();