import api from '../config/api.js';

class AnalyticsService {
  /**
   * @returns {Promise<import('../types/index.js').Analytics>}
   */
  async getAnalytics() {
    // backend ใช้ /analytics/statistics และไม่ห่อ success
    const response = await api.get('/analytics/statistics');
    if (response.status === 200 && response.data) {
      const stats = response.data;
      return {
        totalUsers: stats.totalUsers ?? 0,
        totalIdeas: stats.totalIdeas ?? 0,
        totalComments: stats.totalComments ?? 0,
        totalUpvotes: stats.totalVotes ?? 0,
      };
    }
    throw new Error('Failed to fetch analytics');
  }

  /**
   * @param {string} userId
   */
  async getUserAnalytics(userId) {
    // ยังไม่มี endpoint นี้ใน backend ปัจจุบัน
    const response = await api.get('/analytics/statistics');
    return response.data;
  }

  async getPopularIdeas() {
    const response = await api.get('/analytics/popular');
    return response.data;
  }

  async getTrends(params = { limit: 5, period: 7 }) {
    const response = await api.get(`/analytics/trends?limit=${params.limit}&period=${params.period}`);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();