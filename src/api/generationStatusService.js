import { API_BASE_URL } from '../config/api';
import { tokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from '../config/api';

/**
 * Generation status service using Server-Sent Events (SSE)
 * Uses fetch with streaming since EventSource doesn't support custom headers
 */
export const generationStatusService = {
  /**
   * Subscribe to generation progress updates via SSE
   * @param {string} jobId - Job ID to track
   * @param {Function} onProgress - Callback for progress updates
   * @param {Function} onError - Callback for errors
   * @returns {Function} Cleanup function to close the connection
   */
  subscribeToProgress(jobId, onProgress, onError) {
    const token = tokenStorage.get();
    const url = `${API_BASE_URL}${API_ENDPOINTS.GENERATE_STATUS}/${jobId}`;
    
    let abortController = new AbortController();
    let isClosed = false;

    const fetchStream = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          if (isClosed) break;

          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue; // Skip empty data lines
                
                const data = JSON.parse(jsonStr);
                
                console.log('SSE Event received:', data);
                
                if (data.error) {
                  onError(data.error);
                  return;
                }

                onProgress(data);

                // Close connection if generation is complete or failed
                if (data.status === 'completed' || data.status === 'failed') {
                  console.log('Generation finished with status:', data.status);
                  console.log('Final results:', data.results);
                  isClosed = true;
                  // Don't return immediately - let the loop finish processing
                  break;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError, 'Line:', line);
              }
            }
          }
          
          // Close connection after processing if status is complete/failed
          if (isClosed) {
            break;
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          // Connection was intentionally closed
          return;
        }
        onError(error.message || 'Connection error');
      }
    };

    fetchStream();

    // Return cleanup function
    return () => {
      isClosed = true;
      abortController.abort();
    };
  },
};

