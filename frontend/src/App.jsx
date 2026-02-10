import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './middleware/ProtectedRoute';
import PatientDashboard from './pages/dashboards/patient/PatientDashboard';
import DoctorDashboard from './pages/dashboards/doctor/DoctorDashboard';
import StaffDashboard from './pages/dashboards/staff/StaffDashboard';
import AdminDashboard from './pages/dashboards/admin/AdminDashboard';

const Unauthorized = () => <div className="p-10 text-red-500 text-center"><h1>403 - Unauthorized</h1><p>You do not have permission to access this portal.</p></div>;

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Patient Routes */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route path="/dashboard/patient/*" element={<PatientDashboard />} />
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/dashboard/doctor/*" element={<DoctorDashboard />} />
      </Route>

      {/* Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['hospital_staff']} />}>
        <Route path="/dashboard/staff/*" element={<StaffDashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* Redirect after login based on role */}
      <Route path="/dashboard" element={
        user ? (
          <Navigate
            to={
              user.role === 'hospital_staff' ? '/dashboard/staff' :
                user.role === 'patient' ? '/dashboard/patient' :
                  user.role === 'doctor' ? '/dashboard/doctor' :
                    user.role === 'admin' ? '/dashboard/admin' : '/'
            }
            replace
          />
        ) : <Navigate to="/login" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
