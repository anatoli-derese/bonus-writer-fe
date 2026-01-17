import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { clearTitles } from '../store/slices/titleSlice';
import { isAdmin } from '../utils/jwtDecoder';
import './Header.css';

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check admin status from JWT token on mount and when auth state changes
  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  // Also check when Redux auth state changes (for login)
  const { isAdmin: isAdminFromRedux } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isAdminFromRedux !== undefined) {
      setIsAdminUser(isAdminFromRedux);
    }
  }, [isAdminFromRedux]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutUser());
      navigate('/login', { replace: true });
    }
  };

  const handleHome = () => {
    dispatch(clearTitles());
    navigate('/generate-titles');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo">Bonus Generator</h1>
        </div>
        <nav className="header-nav">
          <button onClick={handleHome} className="header-button">
            🏠 Home
          </button>
          <button onClick={handleHistory} className="header-button">
            📚 History
          </button>
          <button onClick={handleSettings} className="header-button">
            ⚙️ Settings
          </button>
          {isAdminUser && (
            <button onClick={handleAdmin} className="header-button">
              🔧 Admin
            </button>
          )}
          <button onClick={handleLogout} className="header-button logout-button">
            🚪 Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

