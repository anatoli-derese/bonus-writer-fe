import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  generateTitles, 
  clearError, 
  clearTitles,
  toggleTitleSelection, 
  addCustomTitleWithTranslation,
  startBookGeneration
} from '../store/slices/titleSlice';
import { setJobId } from '../store/slices/generationSlice';
import { fetchCurrentUser } from '../store/slices/userSlice';
import { ApiKeyStatusBanner } from '../components/ApiKeyStatusBanner';
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
  const [selectedLanguages, setSelectedLanguages] = useState([]); // Languages for title generation - start with none selected
  const [localError, setLocalError] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTitleLanguage, setCustomTitleLanguage] = useState('en');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    titlesByLanguage, 
    selectedIndices, 
    languages,
    isLoading, 
    isGenerating,
    generationError,
    error 
  } = useAppSelector((state) => state.title);
  const { hasAPIKey } = useAppSelector((state) => state.user);

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

  // Fetch current user info to check API key status
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleToggleLanguage = (langCode) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(langCode)) {
        // If already selected, remove it (allow deselecting all)
        return prev.filter((l) => l !== langCode);
      } else {
        // Add the language
        return [...prev, langCode];
      }
    });
  };

  const isLanguageSelected = (langCode) => {
    return selectedLanguages.includes(langCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    // Check API key status - only block if we're certain they don't have one
    if (hasAPIKey === false) {
      setLocalError('No API key assigned. Please contact admin to assign an API key.');
      return;
    }

    // Validation
    if (!title.trim()) {
      setLocalError('Book title is required');
      return;
    }

    if (selectedLanguages.length === 0) {
      setLocalError('Please select at least one language');
      return;
    }

    const result = await dispatch(
      generateTitles({
        title: title.trim(),
        tableOfContents: tableOfContents.trim() || null,
        languages: selectedLanguages,
      })
    );

    if (generateTitles.rejected.match(result)) {
      // Error is already set in Redux state
    }
  };

  const handleToggleTitle = (index) => {
    dispatch(toggleTitleSelection(index));
  };

  const handleAddCustomTitle = async (e) => {
    e.preventDefault();
    const trimmedTitle = customTitle.trim();
    
    if (!trimmedTitle) {
      return;
    }

    if (!languages || languages.length === 0) {
      setLocalError('No languages available. Please generate titles first.');
      return;
    }

    setLocalError('');
    dispatch(clearError());

    const result = await dispatch(
      addCustomTitleWithTranslation({
        title: trimmedTitle,
        fromLanguage: customTitleLanguage,
        languages: languages,
      })
    );

    if (addCustomTitleWithTranslation.fulfilled.match(result)) {
      setCustomTitle(''); // Clear input after adding
    }
    // Error is already set in Redux state if rejected
  };

  const isTitleSelected = (index) => {
    return selectedIndices.includes(index);
  };

  const handleStartGeneration = async () => {
    // Check API key status - only block if we're certain they don't have one
    if (hasAPIKey === false) {
      setLocalError('No API key assigned. Please contact admin to assign an API key.');
      return;
    }

    // Validation
    if (selectedIndices.length === 0) {
      setLocalError('Please select at least one title to generate');
      return;
    }

    if (!title.trim()) {
      setLocalError('Book title is required');
      return;
    }

    setLocalError('');
    dispatch(clearError());

    // Build titles_by_language object with only selected titles
    const selectedTitlesByLanguage = {};
    languages.forEach((lang) => {
      if (titlesByLanguage[lang]) {
        selectedTitlesByLanguage[lang] = selectedIndices
          .map((index) => titlesByLanguage[lang][index])
          .filter((title) => title !== undefined);
      }
    });

    const result = await dispatch(
      startBookGeneration({
        titlesByLanguage: selectedTitlesByLanguage,
        bookTitle: title.trim(),
        tableOfContents: tableOfContents.trim() || null,
        languages: languages, // Use languages from title generation
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
  const hasTitles = Object.keys(titlesByLanguage).length > 0;
  // Only show API key warning if we're certain the user doesn't have one (hasAPIKey === false)
  // If hasAPIKey is undefined, we don't know, so don't show the warning
  const shouldShowAPIKeyWarning = hasAPIKey === false;
  
  // Get the maximum number of titles across all languages
  const maxTitleCount = hasTitles 
    ? Math.max(...Object.values(titlesByLanguage).map(arr => arr.length), 0)
    : 0;

  return (
    <div className={`title-generation-container ${hasTitles ? 'has-titles' : ''}`}>
      <div className="title-generation-card">
        {!hasTitles ? (
          <>
            <div className="page-header">
              <h1>Generate Titles</h1>
              <p>Enter book details to generate chapter or bonus titles</p>
            </div>

            <form onSubmit={handleSubmit} className="title-form">
              {shouldShowAPIKeyWarning && <ApiKeyStatusBanner />}
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
                <label>
                  Select Languages <span className="required">*</span>
                </label>
                <p className="section-description" style={{ marginTop: '4px', marginBottom: '12px' }}>
                  Choose the languages you want to generate titles and bonuses in
                </p>
                <div className="languages-list">
                  {LANGUAGES.map((lang) => (
                    <div key={lang.value} className="language-item">
                      <label className="language-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isLanguageSelected(lang.value)}
                          onChange={() => handleToggleLanguage(lang.value)}
                          className="language-checkbox"
                        />
                        <span className="language-text">{lang.label}</span>
                      </label>
                    </div>
                  ))}
                </div>

              </div>

              <button
                type="submit"
                className="generate-button"
                disabled={isLoading || selectedLanguages.length === 0 || hasAPIKey === false}
              >
                {isLoading ? 'Generating Titles...' : 'Generate Titles'}
              </button>
              {selectedLanguages.length === 0 && (
                <p className="selection-hint" style={{ marginTop: '8px', textAlign: 'center', color: '#ef4444' }}>
                  Please choose at least one language
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="results-section">
            <div className="page-header">
              <h1>Select Titles</h1>
              <p>Choose the titles you want to use for generation. Titles are synchronized across languages.</p>
            </div>

            <div className="selection-count-badge">
              <span className="selection-count-text">
                {selectedIndices.length} of {maxTitleCount} {selectedIndices.length === 1 ? 'title' : 'titles'} selected
              </span>
            </div>

            {shouldShowAPIKeyWarning && <ApiKeyStatusBanner />}
            {displayError && (
              <div className="error-message" role="alert">
                {displayError}
              </div>
            )}

            {/* Titles displayed in columns by language */}
            <div className="titles-columns-container">
              {languages.map((lang) => {
                const langLabel = LANGUAGES.find(l => l.value === lang)?.label || lang;
                const titles = titlesByLanguage[lang] || [];
                
                return (
                  <div key={lang} className="title-column">
                    <div className="title-column-header">
                      <h3>{langLabel}</h3>
                      <span className="title-count-badge">{titles.length} titles</span>
                    </div>
                    <div className="titles-list">
                      {Array.from({ length: maxTitleCount }, (_, index) => {
                        const title = titles[index];
                        const isSelected = isTitleSelected(index);
                        
                        return (
                          <div key={index} className="title-item">
                            <label className="title-checkbox-label">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleTitle(index)}
                                className="title-checkbox"
                                disabled={!title}
                              />
                              <span className="title-text">
                                {title || <span style={{ color: '#ccc', fontStyle: 'italic' }}>No title</span>}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="add-custom-title-section">
              <h3>Add Custom Title</h3>
              <form onSubmit={handleAddCustomTitle} className="custom-title-form">
                <select
                  value={customTitleLanguage}
                  onChange={(e) => setCustomTitleLanguage(e.target.value)}
                  className="custom-title-language-select"
                  disabled={isLoading}
                >
                  {languages.map((lang) => {
                    const langLabel = LANGUAGES.find(l => l.value === lang)?.label || lang;
                    return (
                      <option key={lang} value={lang}>
                        {langLabel}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter a custom title"
                  className="custom-title-input"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="add-title-button"
                  disabled={isLoading || !customTitle.trim()}
                >
                  {isLoading ? 'Translating...' : 'Add'}
                </button>
              </form>
            </div>

            <div className="start-generation-section">
              <button
                type="button"
                onClick={handleStartGeneration}
                className="start-generation-button"
                disabled={isGenerating || selectedIndices.length === 0 || hasAPIKey === false}
              >
                {isGenerating ? 'Starting Generation...' : 'Start Generation'}
              </button>
              {selectedIndices.length === 0 && (
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
