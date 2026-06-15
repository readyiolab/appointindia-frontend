import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import type { DashboardVariant } from '../types/dashboard';

export type { DashboardVariant };

interface DashboardLayoutProps {
  variant: DashboardVariant;
  showSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  variant,
  showSidebar = true,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background">
      {showSidebar && (
        <Sidebar
          variant={variant}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          variant={variant}
          showSidebar={showSidebar}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showSidebar && <Sidebar variant={variant} desktopOnly />}

          <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-muted/30">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>

        <Footer variant={variant} />
      </div>
    </div>
  );
};

export default DashboardLayout;
