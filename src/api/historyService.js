import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * History service
 */
export const historyService = {
  /**
   * Get generation history
   * @param {number} limit - Number of history items to retrieve (default: 10)
   * @returns {Promise<{generations: Array}>}
   */
  async getHistory(limit = 10) {
    return apiClient.get(`${API_ENDPOINTS.GET_HISTORY}?limit=${limit}`);
  },
};

