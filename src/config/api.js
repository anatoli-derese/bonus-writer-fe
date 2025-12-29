// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bonus-writer-production.up.railway.app';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  GENERATE_TITLES: '/generate-titles',
  START_GENERATE: '/start-generate',
  GENERATE_STATUS: '/generate-status',
  GET_HISTORY: '/get-history',
  DOWNLOAD: '/download',
  DOWNLOAD_FILE: '/download-file',
  TRANSLATE_TEXT: '/translate-text',
};

