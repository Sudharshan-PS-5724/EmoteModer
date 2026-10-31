import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { MoodProvider } from './context/MoodContext.jsx';
import Navigation from './components/Navigation';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ChatPage = lazy(() => import('./components/ChatPage'));
const Login = lazy(() => import('./components/Login'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const CustomChatbot = lazy(() => import('./components/CustomChatbot'));
const PublicGallery = lazy(() => import('./components/PublicGallery'));
const Profile = lazy(() => import('./components/Profile'));
const DemoExperience = lazy(() => import('./components/DemoExperience'));

const RouteLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
    <span className="sr-only">Loading page</span>
    <span className="loading-orbit" aria-hidden="true" />
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }
  
  // Preserve the intended destination so sign-in never feels like a detour.
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const LoginRoute = () => {
  const { user } = useAuth();
  const location = useLocation();
  // Direct visits still land in the personal space; protected links resume in place.
  const destination = location.state?.from?.pathname || '/dashboard';
  return user ? <Navigate to={destination} replace /> : <Login />;
};

// Main App component with animated routes
const AppContent = () => {
  const { user, loading, authError } = useAuth();
  const location = useLocation();
  useDocumentMeta(location.pathname);
  const isDemo = location.pathname === '/demo';

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {user && !isDemo && <Navigation />}
      {user && !isDemo && authError && <div className="auth-notice" role="status">{authError}</div>}
      <div className="route-content">
        <Suspense fallback={<RouteLoading />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/gallery" element={<PublicGallery />} />
            <Route path="/demo" element={<DemoExperience />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Dashboard />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ChatPage />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>

      {user && !isDemo && <Suspense fallback={null}><CustomChatbot /></Suspense>}
    </div>
  );
};

// App wrapper with providers
const App = () => {
  return (
    <AuthProvider>
      <MoodProvider>
        <Router>
          <MotionConfig reducedMotion="user">
            <AppContent />
          </MotionConfig>

        </Router>
      </MoodProvider>
    </AuthProvider>
  );
};

export default App;
