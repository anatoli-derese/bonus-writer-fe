import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { TitleGenerationPage } from './pages/TitleGenerationPage';
import { GenerationProgressPage } from './pages/GenerationProgressPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AdminPanelPage } from './pages/AdminPanelPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/generate-titles"
            element={
              <ProtectedRoute>
                <Layout>
                  <TitleGenerationPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/generation-progress"
            element={
              <ProtectedRoute>
                <Layout>
                  <GenerationProgressPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <HistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPanelPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/generate-titles" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
