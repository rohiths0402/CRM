import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/topbar.css';
import './styles/dashboard.css';
import './styles/franchise.css';
import './styles/admins.css';
import './styles/events.css';
import './styles/partnerships.css';
import './styles/forms.css';
import './styles/settings.css';
import './styles/login.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);