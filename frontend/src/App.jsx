import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Navbar from './components/Navbar';
import VerificationWall from './components/VerificationWall';
import Auth from './pages/Auth';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Chats from './pages/Chats';
import AdminDashboard from './pages/AdminDashboard';

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.08), transparent 70%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(167, 139, 250, 0.15)',
          borderTopColor: '#a78bfa',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Loading...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!token) return <Navigate to="/auth" replace />;
  if (user && user.role !== 'ADMIN') return <Navigate to="/explore" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (token) return <Navigate to="/explore" replace />;
  return children;
}

function AppLayout() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  const isUnverified = token && user && !user.verified;
  const isProfileRoute = location.pathname.startsWith('/profile');
  const isAuthRoute = location.pathname === '/auth';

  return (
    <>
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      {token && <Navbar />}
      {isUnverified && !isProfileRoute && !isAuthRoute ? (
        <VerificationWall />
      ) : (
        <Routes>
          {/* Public */}
          <Route path="/auth" element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          } />

          {/* Protected */}
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/requests" element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          } />
          <Route path="/chats" element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <AppLayout />
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
