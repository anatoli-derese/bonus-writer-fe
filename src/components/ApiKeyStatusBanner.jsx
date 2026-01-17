import './ApiKeyStatusBanner.css';

/**
 * API Key Status Banner Component
 * Displays a warning if user doesn't have an API key assigned
 */
export const ApiKeyStatusBanner = () => {
  return (
    <div className="api-key-status-banner" role="alert">
      <div className="api-key-status-content">
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="api-key-status-icon"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div className="api-key-status-text">
          <strong>No API key assigned</strong>
          <span>Please contact admin to assign an API key before using generation features.</span>
        </div>
      </div>
    </div>
  );
};
