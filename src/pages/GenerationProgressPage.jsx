import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProgress, setError, resetGeneration } from '../store/slices/generationSlice';
import { clearTitles } from '../store/slices/titleSlice';
import { generationStatusService } from '../api/generationStatusService';
import { API_BASE_URL } from '../config/api';
import { API_ENDPOINTS } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';
import './GenerationProgressPage.css';

export const GenerationProgressPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { jobId, progress, isTracking, error, bookTitle } = useAppSelector(
    (state) => state.generation
  );
  const cleanupRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // If no jobId, redirect back to title generation
    if (!jobId) {
      navigate('/generate-titles', { replace: true });
      return;
    }

    // Subscribe to progress updates
    const cleanup = generationStatusService.subscribeToProgress(
      jobId,
      (data) => {
        dispatch(updateProgress(data));
      },
      (errorMessage) => {
        dispatch(setError(errorMessage));
      }
    );

    cleanupRef.current = cleanup;

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [jobId, dispatch, navigate]);

  const handleDownloadZip = async (retryCount = 0) => {
    if (!jobId || !bookTitle || isDownloading) return;

    setIsDownloading(true);
    const token = tokenStorage.get();
    const url = `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD}?book_title=${encodeURIComponent(bookTitle)}&job_id=${jobId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/zip',
        },
      });

      if (!response.ok) {
        // If 500 error and we haven't retried too many times, wait and retry
        if (response.status === 500 && retryCount < 3) {
          setIsDownloading(false); // Allow user to see the button again
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000)); // Exponential backoff: 2s, 4s, 6s
          return handleDownloadZip(retryCount + 1);
        }
        
        // Try to get error message from response
        let errorMessage = 'Download failed';
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          errorMessage = `Server error (${response.status}). Files may still be processing. Please try again in a few moments or check the History page.`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty. Please try again.');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${bookTitle.replace(/\s+/g, '_')}_bonuses.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setIsDownloading(false);
    } catch (err) {
      setIsDownloading(false);
      const errorMessage = err.message || 'Failed to download ZIP file. The files may still be processing. Please try again in a few moments or check the History page.';
      dispatch(setError(errorMessage));
    }
  };

  const handleDownloadFile = async (bonusTitle, fileType) => {
    if (!jobId || !bookTitle) return;

    const token = tokenStorage.get();
    const url = `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_FILE}?book_title=${encodeURIComponent(bookTitle)}&bonus_title=${encodeURIComponent(bonusTitle)}&file_type=${fileType}&job_id=${jobId}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Sanitize filename
      const sanitizedTitle = bonusTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${sanitizedTitle}.${fileType}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      dispatch(setError(`Failed to download ${fileType.toUpperCase()} file. Please try again.`));
    }
  };

  const handleBack = () => {
    dispatch(resetGeneration());
    dispatch(clearTitles());
    navigate('/generate-titles');
  };

  const percentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#737373';
      case 'running':
        return '#525252';
      case 'completed':
        return '#404040';
      case 'failed':
        return '#262626';
      default:
        return '#737373';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'running':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="generation-progress-container">
      <div className="generation-progress-card">
        <div className="page-header">
          <h1>Generation Progress</h1>
          {bookTitle && <p className="book-title">{bookTitle}</p>}
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={handleBack} className="back-button">
              Go Back
            </button>
          </div>
        )}

        {!error && progress && (
          <div className="progress-section">
            {progress.status !== 'completed' && (
              <>
                <div className="status-badge" style={{ backgroundColor: getStatusColor(progress.status) }}>
                  {getStatusLabel(progress.status)}
                </div>

                <div className="progress-info">
                  <div className="progress-stats">
                    <div className="stat-item">
                      <span className="stat-label">Progress:</span>
                      <span className="stat-value">
                        {progress.completed} / {progress.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Remaining:</span>
                      <span className="stat-value">{progress.remaining}</span>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            {progress.status === 'completed' && (
              <div className="completion-section">
                {/* Top section with book title and ZIP download */}
                <div className="download-all-section">
                  <h2 className="book-title-header">{bookTitle}</h2>
                  <button 
                    onClick={handleDownloadZip} 
                    className="download-zip-button"
                    disabled={isDownloading}
                  >
                    {isDownloading ? '⏳ Preparing Download...' : '📦 Download All Files (ZIP)'}
                  </button>
                  <p className="download-hint">
                    {isDownloading 
                      ? 'Files are being prepared. This may take a few moments...' 
                      : 'Note: Files may take a few seconds to be ready after generation completes.'}
                  </p>
                </div>

                {/* Generated files list */}
                {progress.results && Object.keys(progress.results).length > 0 ? (
                  <div className="generated-files-section">
                    <h3 className="files-header">
                      Generated Files ({Object.keys(progress.results).length} bonus
                      {Object.keys(progress.results).length !== 1 ? 'es' : ''})
                    </h3>
                    <div className="files-list">
                      {Object.keys(progress.results).map((bonusTitle) => (
                        <div key={bonusTitle} className="file-item">
                          <div className="file-title">
                            <span className="checkmark">✓</span>
                            <span className="file-name">{bonusTitle}</span>
                          </div>
                          <div className="file-actions">
                            <button
                              onClick={() => handleDownloadFile(bonusTitle, 'pdf')}
                              className="download-pdf-button"
                            >
                              📄 Download PDF
                            </button>
                            <button
                              onClick={() => handleDownloadFile(bonusTitle, 'docx')}
                              className="download-docx-button"
                            >
                              📝 Download DOCX
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-results-message">
                    <p>Generation completed successfully!</p>
                    <p className="hint-text">
                      {progress.results 
                        ? 'No files were generated. Please check the backend logs.' 
                        : 'Results are being processed.'}
                    </p>
                  </div>
                )}

                <button onClick={handleBack} className="back-button-secondary">
                  Generate Another Book
                </button>
              </div>
            )}

            {progress.status === 'failed' && (
              <div className="failure-section">
                <h2>Generation Failed</h2>
                <p>An error occurred during generation. Please try again.</p>
                <button onClick={handleBack} className="back-button">
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}

        {!error && !progress && isTracking && (
          <div className="loading-section">
            <div className="spinner" />
            <p>Connecting to generation service...</p>
          </div>
        )}
      </div>
    </div>
  );
};

