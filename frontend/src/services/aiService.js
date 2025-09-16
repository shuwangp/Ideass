import api from '../config/api.js';

/**
 * AI Service for handling AI-powered features
 */
class AIService {
  /**
   * Get AI suggestions for idea improvement
   * @param {Object} ideaData - Idea data for AI analysis
   * @param {string} ideaData.title - Idea title
   * @param {string} ideaData.description - Idea description
   * @param {string} ideaData.category - Idea category
   * @param {string} ideaData.priority - Idea priority
   * @param {string[]} ideaData.tags - Idea tags
   * @returns {Promise<Object>} AI suggestions
   */
  async getIdeaSuggestions(ideaData) {
    try {
      const response = await api.post('/ai/suggest', ideaData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get AI suggestions');
    } catch (error) {
      console.error('AI Suggestions Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'AI service is currently unavailable'
      );
    }
  }

  /**
   * Analyze idea connections and development
   * @param {string} ideaId - Idea ID
   * @param {string} type - Analysis type ('connections' or 'development')
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeIdea(ideaId, type = 'connections') {
    try {
      const response = await api.post(`/ai/analyze/${ideaId}`, { type });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to analyze idea');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'AI analysis service is currently unavailable'
      );
    }
  }

  /**
   * Get AI-powered search suggestions
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search suggestions
   */
  async getSearchSuggestions(query) {
    try {
      const response = await api.get(`/ai/search-suggestions?query=${encodeURIComponent(query)}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get search suggestions');
    } catch (error) {
      console.error('AI Search Suggestions Error:', error);
      throw new Error(
        error.response?.data?.message || 
        'AI search suggestions service is currently unavailable'
      );
    }
  }

  /**
   * Generate improved idea content using AI
   * @param {Object} ideaData - Original idea data
   * @returns {Promise<Object>} Improved idea content
   */
  async improveIdea(ideaData) {
    try {
      const suggestions = await this.getIdeaSuggestions(ideaData);
      
      return {
        title: suggestions.improvedTitle || ideaData.title,
        description: suggestions.improvedDescription || ideaData.description,
        tags: suggestions.suggestedTags || ideaData.tags || [],
        implementationSteps: suggestions.implementationSteps || [],
        potentialChallenges: suggestions.potentialChallenges || [],
        successMetrics: suggestions.successMetrics || [],
      };
    } catch (error) {
      console.error('AI Improve Idea Error:', error);
      throw error;
    }
  }

  /**
   * Get related ideas analysis
   * @param {string} ideaId - Idea ID
   * @returns {Promise<Object>} Related ideas analysis
   */
  async getRelatedIdeas(ideaId) {
    try {
      const analysis = await this.analyzeIdea(ideaId, 'connections');
      return {
        relatedIdeas: analysis.relatedIdeas || [],
        potentialCollaborations: analysis.potentialCollaborations || [],
        marketOpportunities: analysis.marketOpportunities || [],
      };
    } catch (error) {
      console.error('AI Related Ideas Error:', error);
      throw error;
    }
  }

  /**
   * Get development plan analysis
   * @param {string} ideaId - Idea ID
   * @returns {Promise<Object>} Development plan analysis
   */
  async getDevelopmentPlan(ideaId) {
    try {
      const analysis = await this.analyzeIdea(ideaId, 'development');
      return {
        developmentPhases: analysis.developmentPhases || [],
        technicalRequirements: analysis.technicalRequirements || [],
        riskAssessment: analysis.riskAssessment || [],
        successFactors: analysis.successFactors || [],
      };
    } catch (error) {
      console.error('AI Development Plan Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();


