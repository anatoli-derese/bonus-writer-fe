import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  generateTitles, 
  clearError, 
  clearTitles,
  toggleTitleSelection, 
  addCustomTitle,
  startBookGeneration
} from '../store/slices/titleSlice';
import { setJobId } from '../store/slices/generationSlice';
import './TitleGenerationPage.css';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
];

export const TitleGenerationPage = () => {
  const [title, setTitle] = useState('');
  const [tableOfContents, setTableOfContents] = useState('');
  const [language, setLanguage] = useState('en');
  const [localError, setLocalError] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    titles, 
    selectedTitles, 
    isLoading, 
    isGenerating,
    generationError,
    error 
  } = useAppSelector((state) => state.title);

  // Clear local error when Redux error is cleared
  useEffect(() => {
    if (!error) {
      setLocalError('');
    }
  }, [error]);

  // Clear titles when component mounts to ensure clean state
  useEffect(() => {
    dispatch(clearTitles());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    // Validation
    if (!title.trim()) {
      setLocalError('Book title is required');
      return;
    }

    const result = await dispatch(
      generateTitles({
        title: title.trim(),
        tableOfContents: tableOfContents.trim() || null,
        language,
      })
    );

    if (generateTitles.rejected.match(result)) {
      // Error is already set in Redux state
    }
  };

  const handleToggleTitle = (titleToToggle) => {
    dispatch(toggleTitleSelection(titleToToggle));
  };

  const handleAddCustomTitle = (e) => {
    e.preventDefault();
    const trimmedTitle = customTitle.trim();
    
    if (!trimmedTitle) {
      return;
    }

    dispatch(addCustomTitle(trimmedTitle));
    setCustomTitle(''); // Clear input after adding
  };

  const isTitleSelected = (titleToCheck) => {
    return selectedTitles.includes(titleToCheck);
  };

  const handleStartGeneration = async () => {
    // Validation
    if (selectedTitles.length === 0) {
      setLocalError('Please select at least one title to generate');
      return;
    }

    if (!title.trim()) {
      setLocalError('Book title is required');
      return;
    }

    setLocalError('');
    dispatch(clearError());

    const result = await dispatch(
      startBookGeneration({
        titles: selectedTitles,
        bookTitle: title.trim(),
        tableOfContents: tableOfContents.trim() || null,
        language,
      })
    );

    if (startBookGeneration.fulfilled.match(result)) {
      // Set jobId in generation slice and navigate to progress page
      dispatch(setJobId({
        jobId: result.payload.job_id,
        bookTitle: title.trim(),
      }));
      navigate('/generation-progress');
    }
  };

  const handleBackToForm = () => {
    dispatch(clearTitles());
    setLocalError('');
    dispatch(clearError());
  };

  const displayError = localError || error || generationError;
  const hasTitles = titles.length > 0;

  return (
    <div className="title-generation-container">
      <div className="title-generation-card">
        {!hasTitles ? (
          <>
            <div className="page-header">
              <h1>Generate Titles</h1>
              <p>Enter book details to generate chapter or bonus titles</p>
            </div>

            <form onSubmit={handleSubmit} className="title-form">
              {displayError && (
                <div className="error-message" role="alert">
                  {displayError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="title">
                  Book Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the book title"
                  disabled={isLoading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="tableOfContents">Table of Contents (Optional)</label>
                <textarea
                  id="tableOfContents"
                  value={tableOfContents}
                  onChange={(e) => setTableOfContents(e.target.value)}
                  placeholder="Enter the table of contents (optional)"
                  disabled={isLoading}
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="language">
                  Language <span className="required">*</span>
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isLoading}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="generate-button"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Titles...' : 'Generate Titles'}
              </button>
            </form>
          </>
        ) : (
          <div className="results-section">
            <div className="page-header">
              <h1>Select Titles</h1>
              <p>Choose the titles you want to use for generation</p>
            </div>

            <div className="selection-count-badge">
              <span className="selection-count-text">
                {selectedTitles.length} of {titles.length} {selectedTitles.length === 1 ? 'title' : 'titles'} selected
              </span>
            </div>

            {displayError && (
              <div className="error-message" role="alert">
                {displayError}
              </div>
            )}

            <div className="titles-list">
              {titles.map((generatedTitle, index) => (
                <div key={index} className="title-item">
                  <label className="title-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isTitleSelected(generatedTitle)}
                      onChange={() => handleToggleTitle(generatedTitle)}
                      className="title-checkbox"
                    />
                    <span className="title-text">{generatedTitle}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="add-custom-title-section">
              <h3>Add Custom Title</h3>
              <form onSubmit={handleAddCustomTitle} className="custom-title-form">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter a custom title"
                  className="custom-title-input"
                />
                <button type="submit" className="add-title-button">
                  Add
                </button>
              </form>
            </div>

            <div className="start-generation-section">
              <button
                type="button"
                onClick={handleStartGeneration}
                className="start-generation-button"
                disabled={isGenerating || selectedTitles.length === 0}
              >
                {isGenerating ? 'Starting Generation...' : 'Start Generation'}
              </button>
              {selectedTitles.length === 0 && (
                <p className="selection-hint">
                  Please select at least one title to start generation
                </p>
              )}
            </div>

            <div className="back-to-form-section">
              <button
                type="button"
                onClick={handleBackToForm}
                className="back-to-form-button"
              >
                Generate New Titles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

