import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-red-500/10 blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Animated Shield Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" style={{ animationDuration: '2s' }}></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10">
            <ShieldX className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          403
        </h1>
        <p className="mt-3 text-xl font-semibold text-red-300">
          Access Denied
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          You don't have the required permissions to view this page.
          If you believe this is an error, please contact your administrator.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button className="gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20">
              Sign in with another account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
