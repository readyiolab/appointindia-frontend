import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Shield,
  Building2,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DashboardVariant } from '../../types/dashboard';

interface SidebarProps {
  variant: DashboardVariant;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  desktopOnly?: boolean;
}

const config: Record<
  DashboardVariant,
  {
    title: string;
    subtitle: string;
    accent: string;
    activeNav: string;
    settingsPath: string;
    items: { path: string; label: string; icon: React.ElementType; end?: boolean }[];
  }
> = {
  admin: {
    title: 'Admin Console',
    subtitle: 'Platform control',
    accent: 'from-rose-500/20 to-orange-500/10 border-rose-500/30',
    activeNav: 'bg-rose-600 text-white shadow-md shadow-rose-600/20',
    settingsPath: '/admin',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { path: '/admin/users', label: 'User Management', icon: Users },
    ],
  },
  recruiter: {
    title: 'Recruiter Hub',
    subtitle: 'Hiring workspace',
    accent: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30',
    activeNav: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20',
    settingsPath: '/agent',
    items: [
      { path: '/agent', label: 'Overview', icon: LayoutDashboard, end: true },
      { path: '/agent/post-job', label: 'Post a Job', icon: Briefcase },
      { path: '/agent/applications', label: 'Pipeline', icon: FolderKanban },
    ],
  },
  candidate: {
    title: 'Job Seeker',
    subtitle: 'Your career space',
    accent: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30',
    activeNav: 'bg-teal-600 text-white shadow-md shadow-teal-600/20',
    settingsPath: '/profile',
    items: [
      { path: '/jobs', label: 'Browse Jobs', icon: Search, end: true },
      { path: '/applications', label: 'My Applications', icon: FileText },
      { path: '/profile', label: 'My Profile', icon: UserCheck },
    ],
  },
};

function SidebarContent({
  variant,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  variant: DashboardVariant;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const { title, subtitle, accent, activeNav, settingsPath, items } = config[variant];
  const RoleIcon = variant === 'admin' ? Shield : variant === 'recruiter' ? Building2 : Briefcase;

  return (
    <>
      <div
        className={cn(
          'border-b border-border px-4 py-5',
          collapsed ? 'px-2 text-center' : ''
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-gradient-to-br p-3',
            accent,
            collapsed && 'justify-center p-2'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/80">
            <RoleIcon className="h-5 w-5 text-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? activeNav
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <NavLink
          to={settingsPath}
          onClick={onNavigate}
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? activeNav
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </NavLink>
      </div>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({
  variant,
  mobileOpen = false,
  onMobileClose,
  desktopOnly = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  if (desktopOnly) {
    return (
      <aside
        className={cn(
          'relative hidden h-full shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[4.5rem]' : 'w-64'
        )}
      >
        <SidebarContent
          variant={variant}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>
    );
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent variant={variant} collapsed={false} onNavigate={onMobileClose} />
      </aside>
    </>
  );
};

export default Sidebar;
