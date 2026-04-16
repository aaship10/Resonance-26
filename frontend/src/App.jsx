// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Import your Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AiGeneration from './pages/AiGeneration';
import InvestigationHub from './pages/InvestigationHub';
import NarrativeEditor from './pages/NarrativeEditor';
import AdminDashboard from './pages/AdminDashboard'; // Added
import ComingSoon from './pages/ComingSoon';
import UploadCenter from './pages/UploadCenter';

// A strict security wrapper to prevent URL-guessing
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center bg-surface">Loading Sentinel OS...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // RBAC: If a role is required and the user doesn't have it, bounce them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />; 
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Global Protected Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/upload" 
            element={
              <ProtectedRoute allowedRoles={['Analyst']}>
                <UploadCenter />
              </ProtectedRoute>
            } 
          />

          {/* Analyst / Maker Routes */}
          <Route 
              path="/investigate/:alertId" 
              element={
                <ProtectedRoute allowedRoles={['Analyst']}>
                  <InvestigationHub />
                </ProtectedRoute>
              } 
/>
          <Route 
            path="/generate/:alertId" 
            element={
              <ProtectedRoute allowedRoles={['Analyst']}>
                <AiGeneration />
              </ProtectedRoute>
            } 
          />

          {/* Shared Editor (Maker creates, Checker reviews) */}
          <Route 
            path="/editor/:alertId" 
            element={
              <ProtectedRoute allowedRoles={['Analyst', 'Approver']}>
                <NarrativeEditor />
              </ProtectedRoute>
            } 
          />

          {/* Admin / System Config Route */}
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/investigate/manual" 
            element={
              <ProtectedRoute allowedRoles={['Analyst']}>
                <InvestigationHub mode="manual" />
              </ProtectedRoute>
            } 
/>

          {/* Feature Placeholders (Connected to Sidebar) */}
          <Route path="/archive" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

          {/* Fallback to prevent white-screens */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;