import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import UserLayout from './layouts/UserLayout';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Unauthorized = lazy(() => import('./pages/shared/Unauthorized'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));

// Candidate pages
const Home = lazy(() => import('./pages/candidate/Home'));
const JobListings = lazy(() => import('./pages/candidate/JobListings'));
const JobDetails = lazy(() => import('./pages/candidate/JobDetails'));
const MyApplications = lazy(() => import('./pages/candidate/MyApplications'));
const CandidateProfile = lazy(() => import('./pages/candidate/CandidateProfile'));

// Agent / Recruiter pages
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const PostJob = lazy(() => import('./pages/agent/PostJob'));
const RecruiterApplications = lazy(() => import('./pages/agent/RecruiterApplications'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse font-sans">
          Loading AppointIndia...
        </p>
      </div>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { accessToken, user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!accessToken || !user) {
    return <Navigate to="/" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'recruiter':
    case 'company_admin':
      return <Navigate to="/agent" replace />;
    case 'candidate':
      return <Navigate to="/jobs" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Candidate / Job Seeker Layout Routes */}
          <Route element={<UserLayout />}>
            {/* Job Board pages are public/discoverable */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/job-listings/:id" element={<JobDetails />} />

            {/* Candidate Private Routes */}
            <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/profile" element={<CandidateProfile />} />
            </Route>
          </Route>

          {/* Recruiter / Agent Layout Routes */}
          <Route element={<ProtectedRoute allowedRoles={['recruiter', 'company_admin']} />}>
            <Route element={<AgentLayout />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/post-job" element={<PostJob />} />
              <Route path="/agent/applications" element={<RecruiterApplications />} />
            </Route>
          </Route>

          {/* Admin Layout Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Route>

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
