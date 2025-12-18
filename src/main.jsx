import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './store/store'
import { checkAuth } from './store/slices/authSlice'
import './index.css'
import App from './App.jsx'

// Check authentication status on app load
store.dispatch(checkAuth())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
