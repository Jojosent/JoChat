import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import PublicProfilePage from './pages/PublicProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/main" element={<MainLayout />}>
        {/* ------------------------------------------------------------ */}
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="user/:username" element={<PublicProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="chat" element={<ChatPage />} />
        {/* ------------------------------------------------------------ */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;