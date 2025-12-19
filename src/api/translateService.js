import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Translation service
 */
export const translateService = {
  /**
   * Translate text from one language to multiple languages
   * @param {string} text - Text to translate
   * @param {string} fromLanguage - Source language code (e.g., 'en')
   * @param {string[]} toLanguages - Target language codes array (e.g., ['es', 'fr'])
   * @returns {Promise<{translations: {[lang: string]: string}}>}
   */
  async translateText(text, fromLanguage, toLanguages) {
    return apiClient.post(API_ENDPOINTS.TRANSLATE_TEXT, {
      text,
      from_language: fromLanguage,
      to_languages: toLanguages,
    });
  },
};

