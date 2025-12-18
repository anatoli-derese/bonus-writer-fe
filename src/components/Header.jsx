import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { clearTitles } from '../store/slices/titleSlice';
import './Header.css';

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
          <button onClick={handleLogout} className="header-button logout-button">
            🚪 Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

