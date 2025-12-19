import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Book generation service
 */
export const bookService = {
  /**
   * Start book generation
   * @param {Object} titlesByLanguage - Titles grouped by language { [lang]: string[] }
   * @param {string} bookTitle - Book title
   * @param {string|null} tableOfContents - Table of contents (optional)
   * @param {string[]} languages - Language codes array (e.g., ['en', 'es', 'fr'])
   * @returns {Promise<{job_id: string}>}
   */
  async startGeneration(titlesByLanguage, bookTitle, tableOfContents = null, languages = ['en']) {
    return apiClient.post(API_ENDPOINTS.START_GENERATE, {
      titles_by_language: titlesByLanguage,
      book_title: bookTitle,
      table_of_contents: tableOfContents,
      languages,
    });
  },
};

