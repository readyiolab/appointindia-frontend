import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Floating Ghost */}
        <div className="mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-indigo-500/30 bg-indigo-500/10">
            <Ghost className="h-12 w-12 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-7xl font-black tracking-tight text-white">
          4<span className="text-indigo-400">0</span>4
        </h1>
        <p className="mt-3 text-xl font-semibold text-indigo-300">
          Page Not Found
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => window.history.back()}
            className="gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
