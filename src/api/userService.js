import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * User management service
 */
export const userService = {
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of users with API key information
   */
  async getAllUsers() {
    return apiClient.get(API_ENDPOINTS.USERS);
  },

  /**
   * Assign API key to user
   * @param {string} userId - User ID
   * @param {string} apiId - API key ID
   * @returns {Promise<Object>} - Success message
   */
  async assignAPIKeyToUser(userId, apiId) {
    return apiClient.put(`${API_ENDPOINTS.USER}/${userId}`, {
      api_id: apiId,
    });
  },
};
