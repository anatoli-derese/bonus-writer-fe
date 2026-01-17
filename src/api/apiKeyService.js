import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * API Key management service
 */
export const apiKeyService = {
  /**
   * Create a new API key
   * @param {Object} data - API key data
   * @param {string} data.name - API key name
   * @param {string} data.api_provider - 'gemini' | 'deepseek'
   * @param {string} data.model - Model name
   * @param {string} data.key_content - API key content
   * @returns {Promise<Object>} - Created API key
   */
  async createAPIKey(data) {
    return apiClient.post(API_ENDPOINTS.API_KEYS, {
      name: data.name,
      api_provider: data.api_provider,
      model: data.model,
      key_content: data.key_content,
    });
  },

  /**
   * Get all API keys
   * @returns {Promise<Array>} - Array of API keys
   */
  async getAllAPIKeys() {
    return apiClient.get(API_ENDPOINTS.API_KEYS);
  },

  /**
   * Get API key by ID
   * @param {string} id - API key ID
   * @returns {Promise<Object>} - API key
   */
  async getAPIKeyById(id) {
    return apiClient.get(`${API_ENDPOINTS.API_KEYS}/${id}`);
  },

  /**
   * Update API key
   * @param {string} id - API key ID
   * @param {Object} data - Updated API key data (all fields optional)
   * @param {string|null} data.name - API key name
   * @param {string|null} data.api_provider - 'gemini' | 'deepseek'
   * @param {string|null} data.model - Model name
   * @param {string|null} data.key_content - API key content
   * @returns {Promise<Object>} - Updated API key
   */
  async updateAPIKey(id, data) {
    return apiClient.put(`${API_ENDPOINTS.API_KEYS}/${id}`, {
      name: data.name ?? null,
      api_provider: data.api_provider ?? null,
      model: data.model ?? null,
      key_content: data.key_content ?? null,
    });
  },

  /**
   * Delete API key
   * @param {string} id - API key ID
   * @returns {Promise<Object>} - Success message
   */
  async deleteAPIKey(id) {
    return apiClient.delete(`${API_ENDPOINTS.API_KEYS}/${id}`);
  },
};
