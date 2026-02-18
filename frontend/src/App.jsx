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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const Unauthorized = () => {
  const { logout, user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg w-full text-center shadow-xl font-sans">
        <div className="h-20 w-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">403 - Unauthorized</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          It looks like you're trying to access a portal that doesn't match your current session role
          (<span className="text-emerald-600 font-bold uppercase">{user?.role || 'None'}</span>).
        </p>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-left mb-8">
          <p className="text-amber-800 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
            Session Conflict Detected
          </p>
          <p className="text-amber-700 text-[11px] font-medium leading-relaxed">
            Tabs in the same browser share the same session. If you log in as a <strong>Patient</strong> in Tab A,
            Tab B (Doctor) will lose its permissions.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={logout}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Logout & Try Again
          </button>
          <a
            href="/"
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-bold"
          >
            Return Home
          </a>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Tip: Use Incognito mode to test multiple roles
        </p>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
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
