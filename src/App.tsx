import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/Sidebar';
import { NotificationToasts } from './components/ui/NotificationToasts';
import { DashboardPage } from './pages/DashboardPage';
import { LeavePage } from './pages/LeavePage';
import { TeamPage } from './pages/TeamPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leave" element={<LeavePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </AppLayout>
          <NotificationToasts />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}
