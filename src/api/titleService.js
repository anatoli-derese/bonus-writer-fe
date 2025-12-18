import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Title generation service
 */
export const titleService = {
  /**
   * Generate titles
   * @param {string} title - Book title
   * @param {string|null} tableOfContents - Table of contents (optional)
   * @param {string} language - Language code (en, es, fr, de)
   * @returns {Promise<{titles: string[]}>}
   */
  async generateTitles(title, tableOfContents = null, language = 'en') {
    return apiClient.post(API_ENDPOINTS.GENERATE_TITLES, {
      title,
      table_of_contents: tableOfContents,
      language,
    });
  },
};

