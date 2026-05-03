import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationManager from './components/NotificationManager';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthChoice from './pages/auth/AuthChoice';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import SubmitTicket from './pages/user/SubmitTicket';
import MyTickets from './pages/user/MyTickets';
import SubmitComplaint from './pages/user/SubmitComplaint';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianTickets from './pages/technician/TechnicianTickets';
import TechnicianPerformance from './pages/technician/TechnicianPerformance';
import TechnicianSchedule from './pages/technician/TechnicianSchedule';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTechnicians from './pages/admin/AdminTechnicians';
import AdminAssets from './pages/admin/AdminAssets';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminLeaves from './pages/admin/AdminLeaves';
import ManageSubscriptions from './pages/admin/ManageSubscriptions';

// Shared Pages
import Reports from './pages/shared/Reports';
import Notifications from './pages/shared/Notifications';
import Payments from './pages/shared/Payments';
import Profile from './pages/shared/Profile';
import SubscriptionPayment from './pages/technician/SubscriptionPayment';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'var(--primary)' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{this.state.error?.message}</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
        <div style={{ width: '100%' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/auth-choice" replace />;
  
  if (!user.role) {
    console.error('User role is missing in AuthContext state:', user);
    return <Navigate to="/auth-choice" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'ADMIN' ? '/admin/dashboard'
      : user.role === 'TECHNICIAN' ? '/technician/dashboard'
        : '/user/dashboard';
    
    // Prevent infinite redirect loop if we are already at the target
    if (window.location.pathname === redirect) {
      return <div className="error-screen">Access Denied</div>;
    }
    
    return <Navigate to={redirect} replace />;
  }
  return <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth-choice" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth-choice" element={<AuthChoice />} />
                <Route path="/login" element={<Navigate to="/auth-choice" replace />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/:role" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<RootRedirect />} />

                {/* Protected Routes with Sidebar */}
                <Route element={<RequireAuth allowedRoles={['USER', 'TECHNICIAN', 'ADMIN']} />}>
                  <Route element={<AppLayout />}>
                    {/* User Routes */}
                    <Route element={<RequireAuth allowedRoles={['USER']} />}>
                      <Route path="/user/dashboard" element={<UserDashboard />} />
                      <Route path="/user/tickets/new" element={<SubmitTicket />} />
                      <Route path="/user/tickets" element={<MyTickets />} />
                      <Route path="/user/complaints/new" element={<SubmitComplaint />} />
                    </Route>

                    {/* Technician Routes */}
                    <Route element={<RequireAuth allowedRoles={['TECHNICIAN']} />}>
                      <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                      <Route path="/technician/tickets" element={<TechnicianTickets />} />
                      <Route path="/technician/performance" element={<TechnicianPerformance />} />
                      <Route path="/technician/schedule" element={<TechnicianSchedule />} />
                      <Route path="/technician/subscription" element={<SubscriptionPayment />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/tickets" element={<AdminTickets />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/technicians" element={<AdminTechnicians />} />
                      <Route path="/admin/assets" element={<AdminAssets />} />
                      <Route path="/admin/complaints" element={<AdminComplaints />} />
                      <Route path="/admin/leaves" element={<AdminLeaves />} />
                      <Route path="/admin/subscriptions" element={<ManageSubscriptions />} />
                    </Route>

                    {/* Shared Routes */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/payments" element={<Payments />} />
                  </Route>
                </Route>
              </Routes>
            </ErrorBoundary>

            <NotificationManager />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
            />
          </BrowserRouter>
        </ToastProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
