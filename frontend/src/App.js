import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages....................

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyManagement from './pages/FacultyManagement';
import SubjectManagement from './pages/SubjectManagement';
import MappingManagement from './pages/MappingManagement';
import TimetableGenerator from './pages/TimetableGenerator';
import TimetableView from './pages/TimetableView';
import FacultyTimetable from './pages/FacultyTimetable';
import MyTimetable from './pages/MyTimetable';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

const Unauthorized = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div className="text-center">
      <i className="bi bi-shield-exclamation text-danger" style={{ fontSize: '5rem' }}></i>
      <h2 className="mt-3 fw-bold">Access Denied</h2>
      <p className="text-muted">You don't have permission to access this page.</p>
      <a href="/login" className="btn btn-primary rounded-pill px-4">Back to Login</a>
    </div>
  </div>
);

// Redirect to Angular register page (dev: localhost:4200, prod: deployed Angular URL)
const ANGULAR_BASE = process.env.NODE_ENV === 'production'
  ? ''        // Replace with your Angular deployment URL e.g. 'https://schedulix-angular.vercel.app'
  : 'http://localhost:4200';

const RedirectToAngularRegister = () => {
  React.useEffect(() => {
    if (ANGULAR_BASE) {
      window.location.href = `${ANGULAR_BASE}/register`;
    } else {
      // Fallback: stay on React login if Angular not deployed yet
      window.location.href = '/login';
    }
  }, []);
  return null;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          {/* Register is handled by Angular app at port 4200 */}
          <Route path="/register" element={<RedirectToAngularRegister />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin only */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/faculty" element={
            <ProtectedRoute roles={['admin']}><FacultyManagement /></ProtectedRoute>
          } />
          <Route path="/subjects" element={
            <ProtectedRoute roles={['admin']}><SubjectManagement /></ProtectedRoute>
          } />
          <Route path="/mappings" element={
            <ProtectedRoute roles={['admin']}><MappingManagement /></ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute roles={['admin']}><TimetableGenerator /></ProtectedRoute>
          } />

          {/* Admin + Faculty */}
          <Route path="/faculty-timetable" element={
            <ProtectedRoute roles={['admin', 'faculty']}><FacultyTimetable /></ProtectedRoute>
          } />
          <Route path="/my-timetable" element={
            <ProtectedRoute roles={['faculty']}><MyTimetable /></ProtectedRoute>
          } />

          {/* All roles */}
          <Route path="/timetable" element={
            <ProtectedRoute roles={['admin', 'faculty', 'student']}><TimetableView /></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
