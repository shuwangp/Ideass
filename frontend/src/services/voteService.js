import api from '../config/api.js';

/**
 * @typedef {Object} VoteData
 * @property {'up' | 'down'} type
 * @property {string} ideaId
 */

class VoteService {
  /**
   * @param {VoteData} data
   * @returns {Promise<import('../types/index.js').Vote>}
   */
  async vote(data) {
    const response = await api.post(`/ideas/${data.ideaId}/votes`, {
      type: data.type
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to vote');
  }

  /**
   * @param {string} ideaId
   */
  async removeVote(ideaId) {
    const response = await api.delete(`/ideas/${ideaId}/votes`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove vote');
    }
  }

  /**
   * @param {string} ideaId
   * @returns {Promise<{upVotes: number, downVotes: number, userVote?: 'up' | 'down'}>}
   */
  async getVoteStats(ideaId) {
    const response = await api.get(`/ideas/${ideaId}/vote-stats`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch vote stats');
  }
}

export const voteService = new VoteService();