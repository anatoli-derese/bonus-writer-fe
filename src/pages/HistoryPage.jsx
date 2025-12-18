import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHistory } from '../store/slices/historySlice';
import { API_BASE_URL } from '../config/api';
import { API_ENDPOINTS } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';
import './HistoryPage.css';

export const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const { generations, isLoading, error } = useAppSelector((state) => state.history);

  useEffect(() => {
    dispatch(fetchHistory(10)); // Fetch last 10 generations
  }, [dispatch]);

  const handleDownloadZip = (bookTitle, jobId) => {
    if (!jobId || !bookTitle) return;

    const token = tokenStorage.get();
    const url = `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD}?book_title=${encodeURIComponent(bookTitle)}&job_id=${jobId}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Download failed');
        }
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${bookTitle.replace(/\s+/g, '_')}_bonuses.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error('Download error:', err);
        alert('Failed to download ZIP file. Please try again.');
      });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="page-header">
          <h1>Generation History</h1>
          <p>View and download your previously generated books</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <div className="spinner" />
            <p>Loading history...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {generations.length === 0 ? (
              <div className="empty-state">
                <p>No generation history found.</p>
                <p className="hint-text">Start generating books to see them here.</p>
              </div>
            ) : (
              <div className="history-list">
                {generations.map((generation, index) => (
                  <div key={generation.job_id || index} className="history-item">
                    <div className="history-item-content">
                      <div className="history-item-header">
                        <h3 className="history-book-title">{generation.book_title}</h3>
                        <span className="history-date">
                          {formatDate(generation.created_at)}
                        </span>
                      </div>
                      <div className="history-item-details">
                        <div className="detail-item">
                          <span className="detail-label">Total Bonuses:</span>
                          <span className="detail-value">{generation.total_bonuses || 0}</span>
                        </div>
                        {generation.bonus_titles && generation.bonus_titles.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">Bonus Titles:</span>
                            <div className="bonus-titles-list">
                              {generation.bonus_titles.slice(0, 3).map((title, idx) => (
                                <span key={idx} className="bonus-title-tag">
                                  {title}
                                </span>
                              ))}
                              {generation.bonus_titles.length > 3 && (
                                <span className="bonus-title-tag more">
                                  +{generation.bonus_titles.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="history-item-actions">
                      <button
                        onClick={() => handleDownloadZip(generation.book_title, generation.job_id)}
                        className="download-history-button"
                      >
                        📦 Download ZIP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

