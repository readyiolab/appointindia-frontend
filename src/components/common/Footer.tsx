import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import type { DashboardVariant } from '../../types/dashboard';

const variantAccent: Record<DashboardVariant, string> = {
  admin: 'text-rose-500',
  recruiter: 'text-indigo-500',
  candidate: 'text-teal-500',
};

interface FooterProps {
  variant: DashboardVariant;
}

export const Footer: React.FC<FooterProps> = ({ variant }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-border bg-card/80 px-4 py-3 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Briefcase className={`h-4 w-4 ${variantAccent[variant]}`} />
          <span>
            © {year} <span className="font-semibold text-foreground">AppointIndia</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/jobs" className="transition-colors hover:text-foreground">
            Jobs
          </Link>
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
