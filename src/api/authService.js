import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{access_token: string, token_type: string}>}
   */
  async login(username, password) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });

    // Store token
    if (response.access_token) {
      tokenStorage.set(response.access_token);
    }

    return response;
  },

  /**
   * Logout user
   */
  logout() {
    tokenStorage.remove();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return tokenStorage.hasToken();
  },

  /**
   * Get current token
   * @returns {string | null}
   */
  getToken() {
    return tokenStorage.get();
  },

  /**
   * Change user password
   * @param {string} adminKey
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise<any>}
   */
  async changePassword(adminKey, oldPassword, newPassword) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      admin_key: adminKey,
      old_password: oldPassword,
      new_password: newPassword,
    });

    return response;
  },
};

