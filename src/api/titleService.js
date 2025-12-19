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
   * @param {string[]} languages - Language codes array (e.g., ['en', 'es'])
   * @returns {Promise<{titles_by_language: {[lang: string]: string[]}}>}
   */
  async generateTitles(title, tableOfContents = null, languages = ['en']) {
    return apiClient.post(API_ENDPOINTS.GENERATE_TITLES, {
      title,
      table_of_contents: tableOfContents,
      languages,
    });
  },
};

