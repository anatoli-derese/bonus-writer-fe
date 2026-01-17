import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAPIKeys,
  createAPIKey,
  updateAPIKey,
  deleteAPIKey,
  fetchUsers,
  assignAPIKey,
  clearError,
} from '../store/slices/adminSlice';
import { isAdmin } from '../utils/jwtDecoder';
import './AdminPanelPage.css';

/**
 * Mask API key for display (show only last 4 characters)
 */
const maskAPIKey = (key) => {
  if (!key || key.length <= 4) {
    return '****';
  }
  const last4 = key.slice(-4);
  return `****-****-****-${last4}`;
};

export const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(new Set()); // Track which API keys are visible
  const [showKeyInCreateModal, setShowKeyInCreateModal] = useState(false); // Track visibility in create modal
  const [showKeyInEditModal, setShowKeyInEditModal] = useState(false); // Track visibility in edit modal
  const [formData, setFormData] = useState({
    name: '',
    api_provider: 'gemini',
    model: 'gemini-3-flash-preview',
    key_content: '',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { apiKeys, users, isLoading, error } = useAppSelector((state) => state.admin);
  const [isAdminUser, setIsAdminUser] = useState(null); // null = checking, true/false = determined

  // Check admin status on mount from JWT token directly
  useEffect(() => {
    const checkAdmin = () => {
      const adminStatus = isAdmin();
      setIsAdminUser(adminStatus);
      if (!adminStatus) {
        navigate('/generate-titles', { replace: true });
        return;
      }
      // Fetch data when admin status is confirmed
      dispatch(fetchAPIKeys());
      dispatch(fetchUsers());
    };
    checkAdmin();
  }, [navigate, dispatch]);

  // Don't render if not admin or still checking
  if (isAdminUser === null || !isAdminUser) {
    return null;
  }

  const handleCreateAPIKey = async (e) => {
    e.preventDefault();
    const result = await dispatch(createAPIKey(formData));
    if (createAPIKey.fulfilled.match(result)) {
      setShowCreateModal(false);
      setFormData({
        name: '',
        api_provider: 'gemini',
        model: 'gemini-3-flash-preview',
        key_content: '',
      });
      dispatch(fetchAPIKeys());
    }
  };

  const handleEditAPIKey = (key) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      api_provider: key.api_provider,
      model: key.model,
      key_content: key.key_content,
    });
    setShowKeyInEditModal(false); // Reset visibility when opening edit modal
    setShowEditModal(true);
  };

  const handleUpdateAPIKey = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateAPIKey({ id: editingKey.id, data: formData }));
    if (updateAPIKey.fulfilled.match(result)) {
      setShowEditModal(false);
      setEditingKey(null);
      setFormData({
        name: '',
        api_provider: 'gemini',
        model: 'gemini-3-flash-preview',
        key_content: '',
      });
      dispatch(fetchAPIKeys());
    }
  };

  const handleDeleteAPIKey = async (id) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      const result = await dispatch(deleteAPIKey(id));
      if (deleteAPIKey.fulfilled.match(result)) {
        dispatch(fetchAPIKeys());
        dispatch(fetchUsers()); // Refresh users to update API key references
      }
    }
  };

  const handleAssignAPIKey = async (userId, apiId) => {
    const result = await dispatch(assignAPIKey({ userId, apiId }));
    if (assignAPIKey.fulfilled.match(result)) {
      dispatch(fetchUsers());
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingKey(null);
    setShowKeyInCreateModal(false);
    setShowKeyInEditModal(false);
    setFormData({
      name: '',
      api_provider: 'gemini',
      model: 'gemini-3-flash-preview',
      key_content: '',
    });
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <h1>Admin Panel</h1>
          <p>Manage API keys and user assignments</p>
        </div>

        {error && (
          <div className="admin-error-banner" role="alert">
            {error}
            <button onClick={() => dispatch(clearError())} className="close-error-btn">×</button>
          </div>
        )}

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'api-keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-keys')}
          >
            API Keys
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {activeTab === 'api-keys' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h2>API Key Management</h2>
              <button
                className="admin-button primary"
                onClick={() => setShowCreateModal(true)}
                disabled={isLoading}
              >
                + Create API Key
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="admin-empty-state">
                <p>No API keys found. Create one to get started.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Provider</th>
                      <th>Model</th>
                      <th>API Key</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td>{key.name}</td>
                        <td>{key.api_provider}</td>
                        <td>{key.model}</td>
                        <td className="api-key-cell">
                          <div className="api-key-display-wrapper">
                            <code>{visibleKeys.has(key.id) ? key.key_content : maskAPIKey(key.key_content)}</code>
                            <button
                              type="button"
                              className="api-key-toggle-btn"
                              onClick={() => toggleKeyVisibility(key.id)}
                              aria-label={visibleKeys.has(key.id) ? 'Hide API key' : 'Show API key'}
                              title={visibleKeys.has(key.id) ? 'Hide API key' : 'Show API key'}
                            >
                              {visibleKeys.has(key.id) ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-button small"
                              onClick={() => handleEditAPIKey(key)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-button small danger"
                              onClick={() => handleDeleteAPIKey(key.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h2>User Management</h2>
              <button
                className="admin-button secondary"
                onClick={() => dispatch(fetchUsers())}
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>

            {users.length === 0 ? (
              <div className="admin-empty-state">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Assigned API Key</th>
                      <th>Provider</th>
                      <th>Model</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>
                          {user.api_key ? (
                            <span className="api-key-assigned">{user.api_key.name}</span>
                          ) : (
                            <span className="api-key-not-assigned">Not assigned</span>
                          )}
                        </td>
                        <td>
                          {user.api_key ? user.api_key.api_provider : '-'}
                        </td>
                        <td>
                          {user.api_key ? user.api_key.model : '-'}
                        </td>
                        <td>
                          <select
                            className="admin-select"
                            value={user.api_key?.id || ''}
                            onChange={(e) => handleAssignAPIKey(user.id, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">None</option>
                            {apiKeys.map((key) => (
                              <option key={key.id} value={key.id}>
                                {key.name} ({key.api_provider})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="admin-modal-overlay" onClick={handleCloseModals}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Create API Key</h3>
                <button className="admin-modal-close" onClick={handleCloseModals}>×</button>
              </div>
              <form onSubmit={handleCreateAPIKey} className="admin-form">
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Provider</label>
                  <select
                    value={formData.api_provider}
                    onChange={(e) => {
                      const provider = e.target.value;
                      setFormData({
                        ...formData,
                        api_provider: provider,
                        model: provider === 'gemini' ? 'gemini-3-flash-preview' : 'deepseek-chat',
                      });
                    }}
                    required
                    disabled={isLoading}
                  >
                    <option value="gemini">Gemini</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                    disabled={isLoading}
                  >
                    {formData.api_provider === 'gemini' ? (
                      <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                    ) : (
                      <option value="deepseek-chat">deepseek-chat</option>
                    )}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>API Key Content</label>
                  <div className="admin-form-input-wrapper">
                    <input
                      type={showKeyInCreateModal ? 'text' : 'password'}
                      value={formData.key_content}
                      onChange={(e) => setFormData({ ...formData, key_content: e.target.value })}
                      required
                      disabled={isLoading}
                      placeholder="Enter API key"
                    />
                    <button
                      type="button"
                      className="admin-form-toggle-btn"
                      onClick={() => setShowKeyInCreateModal(!showKeyInCreateModal)}
                      aria-label={showKeyInCreateModal ? 'Hide API key' : 'Show API key'}
                      title={showKeyInCreateModal ? 'Hide API key' : 'Show API key'}
                      disabled={isLoading}
                    >
                      {showKeyInCreateModal ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-button secondary" onClick={handleCloseModals}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-button primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingKey && (
          <div className="admin-modal-overlay" onClick={handleCloseModals}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Edit API Key</h3>
                <button className="admin-modal-close" onClick={handleCloseModals}>×</button>
              </div>
              <form onSubmit={handleUpdateAPIKey} className="admin-form">
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Provider</label>
                  <select
                    value={formData.api_provider}
                    onChange={(e) => {
                      const provider = e.target.value;
                      setFormData({
                        ...formData,
                        api_provider: provider,
                        model: provider === 'gemini' ? 'gemini-3-flash-preview' : 'deepseek-chat',
                      });
                    }}
                    required
                    disabled={isLoading}
                  >
                    <option value="gemini">Gemini</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                    disabled={isLoading}
                  >
                    {formData.api_provider === 'gemini' ? (
                      <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                    ) : (
                      <option value="deepseek-chat">deepseek-chat</option>
                    )}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>API Key Content</label>
                  <div className="admin-form-input-wrapper">
                    <input
                      type={showKeyInEditModal ? 'text' : 'password'}
                      value={formData.key_content}
                      onChange={(e) => setFormData({ ...formData, key_content: e.target.value })}
                      required
                      disabled={isLoading}
                      placeholder="Enter API key"
                    />
                    <button
                      type="button"
                      className="admin-form-toggle-btn"
                      onClick={() => setShowKeyInEditModal(!showKeyInEditModal)}
                      aria-label={showKeyInEditModal ? 'Hide API key' : 'Show API key'}
                      title={showKeyInEditModal ? 'Hide API key' : 'Show API key'}
                      disabled={isLoading}
                    >
                      {showKeyInEditModal ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-button secondary" onClick={handleCloseModals}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-button primary" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
