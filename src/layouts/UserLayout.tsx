import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

export const UserLayout = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Check if current path is a public seeker page (home, list, details)
  const isPublicSeekerPage =
    location.pathname === '/' ||
    location.pathname === '/jobs' ||
    location.pathname.startsWith('/job-listings');

  if (isPublicSeekerPage) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-zinc-950">
        <Navbar variant="candidate" showSidebar={false} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer variant="candidate" />
      </div>
    );
  }

  return <DashboardLayout variant="candidate" showSidebar={isLoggedIn} />;
};

export default UserLayout;
