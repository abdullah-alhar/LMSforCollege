import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FirstLoginModal from './components/FirstLoginModal';
import AppErrorBoundary from './components/AppErrorBoundary';

import SplashScreen   from './pages/SplashScreen';
import Login          from './pages/Login';
import Home           from './pages/Home';
import SubjectFolders from './pages/SubjectFolders';
import VideoList      from './pages/VideoList';
import SectionFolders from './pages/SectionFolders';
import VideoPlayer    from './pages/VideoPlayer';
import LockedContent  from './pages/LockedContent';
import ExpiredAccess  from './pages/ExpiredAccess';
import ProfileSettings from './pages/ProfileSettings';
import PaymentDetails from './pages/PaymentDetails';
import NoticesPage from './pages/NoticesPage';

import Dashboard      from './pages/admin/Dashboard';
import StudentsList   from './pages/admin/StudentsList';
import StudentForm    from './pages/admin/StudentForm';
import RecentLogins   from './pages/admin/RecentLogins';

/* Pages that should NOT have the Navbar or main-content padding */
const BARE_ROUTES = ['/splash', '/login'];

const AppShell = () => {
  const location = useLocation();
  const isBare   = BARE_ROUTES.includes(location.pathname);
  const { user } = useAuth();

  // Show first-login modal for students who haven't completed their profile
  const showFirstLoginModal =
    user &&
    user.role !== 'ADMIN' &&
    user.profileComplete === false &&
    !isBare;

  return (
    <div className={`app-container ${isBare ? 'bare-layout' : 'sidebar-layout'}`}>
      {!isBare && <Navbar />}

      {/* First-login profile completion modal (non-skippable) */}
      {showFirstLoginModal && <FirstLoginModal />}

      {isBare ? (
        <Routes>
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login"  element={<Login />} />
        </Routes>
      ) : (
        <main className="main-content">
          <AppErrorBoundary key={location.pathname}>
          <Routes>
            {/* Student routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />
            <Route path="/notices" element={<ProtectedRoute><NoticesPage /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectFolders /></ProtectedRoute>} />
            <Route path="/subject/:id/section/:sectionId" element={<ProtectedRoute><SectionFolders /></ProtectedRoute>} />
            <Route path="/subject/:id/section/:sectionId/folder/:folderId" element={<ProtectedRoute><VideoList /></ProtectedRoute>} />
            <Route path="/video/:videoId" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
            <Route path="/locked/:subjectId" element={<ProtectedRoute><LockedContent /></ProtectedRoute>} />
            <Route path="/expired" element={<ProtectedRoute><ExpiredAccess /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute requireAdmin><StudentsList /></ProtectedRoute>} />
            <Route path="/admin/students/new" element={<ProtectedRoute requireAdmin><StudentForm /></ProtectedRoute>} />
            <Route path="/admin/notices" element={<ProtectedRoute requireAdmin><NoticesPage /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><PaymentDetails adminMode /></ProtectedRoute>} />
            <Route path="/super-admin/recent-logins" element={<ProtectedRoute requireSuperAdmin><RecentLogins /></ProtectedRoute>} />
          </Routes>
          </AppErrorBoundary>
        </main>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
