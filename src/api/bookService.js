import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Book generation service
 */
export const bookService = {
  /**
   * Start book generation
   * @param {string[]} titles - Selected titles array
   * @param {string} bookTitle - Book title
   * @param {string|null} tableOfContents - Table of contents (optional)
   * @param {string} language - Language code (en, es, fr, de, it)
   * @returns {Promise<{job_id: string}>}
   */
  async startGeneration(titles, bookTitle, tableOfContents = null, language = 'en') {
    return apiClient.post(API_ENDPOINTS.START_GENERATE, {
      titles,
      book_title: bookTitle,
      table_of_contents: tableOfContents,
      language,
    });
  },
};

