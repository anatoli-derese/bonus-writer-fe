// Token storage utilities
const TOKEN_KEY = 'access_token';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  },

  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  },

  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  },

  hasToken: () => {
    return !!tokenStorage.get();
  },
};

