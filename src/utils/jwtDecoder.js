import { tokenStorage } from './tokenStorage';

/**
 * Decode JWT token payload
 * JWT format: header.payload.signature
 * @param {string} token - JWT token string
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if current user is admin by decoding JWT token
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isAdmin = () => {
  const token = tokenStorage.get();
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return false;
  }

  return payload.is_admin === true;
};

/**
 * Get admin status from JWT token
 * @param {string} token - JWT token string
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const getAdminStatusFromToken = (token) => {
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return false;
  }

  return payload.is_admin === true;
};
