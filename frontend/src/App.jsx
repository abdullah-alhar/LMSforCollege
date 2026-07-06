import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FirstLoginModal from './components/FirstLoginModal';
import AppErrorBoundary from './components/AppErrorBoundary';

import PublicLanding from './pages/PublicLanding';

const SplashScreen = lazy(() => import('./pages/SplashScreen'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const SubjectFolders = lazy(() => import('./pages/SubjectFolders'));
const VideoList = lazy(() => import('./pages/VideoList'));
const SectionFolders = lazy(() => import('./pages/SectionFolders'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const LockedContent = lazy(() => import('./pages/LockedContent'));
const ExpiredAccess = lazy(() => import('./pages/ExpiredAccess'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const PaymentDetails = lazy(() => import('./pages/PaymentDetails'));
const NoticesPage = lazy(() => import('./pages/NoticesPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentsList = lazy(() => import('./pages/admin/StudentsList'));
const StudentForm = lazy(() => import('./pages/admin/StudentForm'));
const RecentLogins = lazy(() => import('./pages/admin/RecentLogins'));

const PageLoader = () => (
  <div className="route-loader" role="status" aria-label="Loading page">
    <span />
  </div>
);

/* Pages that should NOT have the Navbar or main-content padding */
const BARE_ROUTES = ['/splash', '/login'];

const AppShell = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isPublicHome = location.pathname === '/' && !user;
  const isBare   = BARE_ROUTES.includes(location.pathname) || isPublicHome;

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

      <Suspense fallback={<PageLoader />}>
        {isBare ? (
          <Routes>
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/" element={<PublicLanding />} />
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
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
      <Analytics />
    </>
  );
}

export default App;
