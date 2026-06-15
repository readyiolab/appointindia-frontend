import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useTheme } from '../theme-provider';
import type { DashboardVariant } from '../../types/dashboard';
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Menu,
  Briefcase,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/button';

interface NavbarProps {
  variant?: DashboardVariant;
  showSidebar?: boolean;
  onMenuClick?: () => void;
}

const variantBadge: Record<DashboardVariant, string> = {
  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  recruiter: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  candidate: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

export const Navbar: React.FC<NavbarProps> = ({
  variant = 'candidate',
  showSidebar = true,
  onMenuClick,
}) => {
  const { user, logout } = useAuth();
  const { isCandidate, isRecruiter, isCompanyAdmin, isAdmin } = useRole();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your application was viewed', read: false, time: '2h ago' },
    { id: 2, text: 'New job match available', read: false, time: '5h ago' },
    { id: 3, text: 'Interview reminder', read: true, time: '1d ago' },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isRecruiter || isCompanyAdmin) return '/agent';
    return '/jobs';
  };

  const getProfilePath = () => {
    if (isCandidate) return '/profile';
    return getDashboardPath();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const roleLabel =
    variant === 'admin' ? 'Administrator' : variant === 'recruiter' ? 'Recruiter' : 'Job Seeker';

  return (
    <header className="z-30 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link to={user ? getDashboardPath() : '/'} className="flex min-w-0 items-center gap-1.5">
            <Briefcase className="h-6 w-6 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="truncate text-xl font-black text-blue-600 dark:text-blue-400 font-sans tracking-tight">
              appoint<span className="text-indigo-600 dark:text-indigo-400">india</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 ml-6">
            <Link to="/jobs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-white transition-colors">
              Jobs
            </Link>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-white transition-colors">
              Companies
            </a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-white transition-colors">
              Services
            </a>
          </div>

          {user && (
            <span
              className={`hidden rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline ml-3 ${variantBadge[variant]}`}
            >
              {roleLabel}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground mr-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-muted-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>

              {notificationsOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                  />
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-popover p-2 shadow-lg">
                    <div className="flex items-center justify-between border-b border-border px-2 py-2">
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNotifications(notifications.map((n) => ({ ...n, read: true })))
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`rounded-md px-2 py-2 text-xs ${!notif.read ? 'bg-accent/50 font-medium' : ''}`}
                        >
                          <p className="text-foreground">{notif.text}</p>
                          <p className="mt-1 text-muted-foreground">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                {user.email.substring(0, 2).toUpperCase()}
              </button>

              {profileDropdownOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                    aria-label="Close profile menu"
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-medium">{user.email}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    {isCandidate && (
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                    )}
                    <Link
                      to={getProfilePath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-accent dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login">
                <button
                  type="button"
                  className="px-5 py-1.5 text-sm font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-zinc-900 transition-colors"
                >
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button
                  type="button"
                  className="px-5 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
