/**
 * Parse LLM error message to extract provider and error type
 * @param {string} errorMessage - Error message from API
 * @returns {object} - Parsed error with provider and type
 */
export const parseLLMError = (errorMessage) => {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return { provider: null, type: 'unknown', message: errorMessage };
  }

  const lowerMessage = errorMessage.toLowerCase();

  // Detect provider
  let provider = null;
  if (lowerMessage.includes('gemini')) {
    provider = 'Gemini';
  } else if (lowerMessage.includes('deepseek')) {
    provider = 'DeepSeek';
  }

  // Detect error type
  let type = 'unknown';
  let userMessage = errorMessage;

  if (lowerMessage.includes('invalid api key') || lowerMessage.includes('authentication')) {
    type = 'authentication';
    userMessage = provider 
      ? `Your ${provider} API key is invalid.`
      : 'Your API key is invalid.';
  } else if (lowerMessage.includes('rate limit')) {
    type = 'rate_limit';
    userMessage = provider
      ? `${provider} API rate limit exceeded. Please try again later.`
      : 'API rate limit exceeded. Please try again later.';
  } else if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    type = 'timeout';
    userMessage = provider
      ? `${provider} API request timed out. Please try again.`
      : 'API request timed out. Please try again.';
  } else if (lowerMessage.includes('api error')) {
    type = 'api_error';
    userMessage = provider
      ? `${provider} API error occurred. Please try again later.`
      : 'API error occurred. Please try again later.';
  }

  return {
    provider,
    type,
    message: userMessage,
    originalMessage: errorMessage,
  };
};

/**
 * Get user-friendly error message based on HTTP status code and error detail
 * @param {number} status - HTTP status code
 * @param {string} detail - Error detail message from API
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (status, detail) => {
  if (!detail || typeof detail !== 'string') {
    detail = 'An error occurred';
  }

  // Check for specific error messages
  if (detail.includes('does not have an API key configured') || 
      detail.includes('API key configured')) {
    return detail || 'API key configuration error.';
  }

  // Handle LLM errors
  if (status === 401 || status === 429 || status === 504 || status === 502) {
    const parsed = parseLLMError(detail);
    return parsed.message;
  }

  // Map status codes to user-friendly messages
  switch (status) {
    case 400:
      return detail || 'Invalid request. Please check your input.';
    case 401:
      if (detail.includes('Invalid API key') || detail.includes('API key')) {
        const parsed = parseLLMError(detail);
        return parsed.message;
      }
      return 'Authentication failed. Please login again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return detail || 'Resource not found.';
    case 429:
      const parsed429 = parseLLMError(detail);
      return parsed429.message;
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      const parsed502 = parseLLMError(detail);
      return parsed502.message;
    case 504:
      const parsed504 = parseLLMError(detail);
      return parsed504.message;
    default:
      return detail || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Format error for display in UI
 * @param {Error|ApiError} error - Error object
 * @returns {string} - Formatted error message
 */
export const formatError = (error) => {
  if (!error) {
    return 'An error occurred';
  }

  // Handle ApiError with status
  if (error.status && error.message) {
    return getUserFriendlyError(error.status, error.message);
  }

  // Handle regular Error
  if (error.message) {
    return getUserFriendlyError(0, error.message);
  }

  return 'An unexpected error occurred';
};
