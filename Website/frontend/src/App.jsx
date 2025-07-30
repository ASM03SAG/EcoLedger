// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import LoginRegisterPage from './components/LoginRegisterPage';
import Dashboard from './components/Dashboard';
import UploadPage from './components/UploadPage';
import AuthenticationPage from './components/AuthenticationPage';
import AdminPage from './components/AdminPage';
import NotAuthorized from './components/NotAuthorized';
import ListingDetails from './components/ListingDetails';
import AInsights from './components/AInsights';
import NotificationsPage from './components/NotificationsPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import AdminGate from './components/AdminGate';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/authenticate-result" element={<AuthenticationPage />} />
        <Route path="/admin-accessed" element={<AdminPage />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/enter-listing" element={<ListingDetails />} />
        <Route path="/aiinsights" element={<AInsights />}/>
        <Route path="/notifications" element={<NotificationsPage />}/>
        <Route path="/settings" element={<SettingsPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/admin" element={<AdminGate />}/>
        
      </Routes>
    </div>
  );
}

export default App;