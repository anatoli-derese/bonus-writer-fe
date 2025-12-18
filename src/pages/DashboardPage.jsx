import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutUser());
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <p>Welcome! This is the dashboard page.</p>
        <p>Book generation features will be implemented here.</p>
      </div>
    </div>
  );
};

