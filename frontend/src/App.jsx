import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage      from './pages/LandingPage';
import Login            from './pages/Login';
import Register         from './pages/Register';
import StaffLogin       from './pages/StaffLogin';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard   from './pages/StaffDashboard';
import AdminDashboard   from './pages/AdminDashboard';

function PrivateRoute({ children, roles }) {
  const { loading } = useAuth();

  // Wait for AuthContext to finish restoring from localStorage
  if (loading) return null;

  // Read directly from localStorage — avoids React state timing gap
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (stored && token) user = JSON.parse(stored);
  } catch { /* corrupted storage */ }

  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/staff/login" element={<StaffLogin />} />

          <Route path="/student" element={
            <PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>
          } />
          <Route path="/staff" element={
            <PrivateRoute roles={['staff', 'admin']}><StaffDashboard /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}