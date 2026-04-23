import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/main" element={<MainLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route index element={<Navigate to="profile" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;