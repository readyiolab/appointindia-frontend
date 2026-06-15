import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginThunk } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../app/hooks';
import { AuthLayout, AuthBrandLink, type AuthPersona } from '../../components/auth/AuthLayout';
import { AuthPersonaTabs } from '../../components/auth/AuthPersonaTabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

function getHomePath(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter' || role === 'company_admin') return '/agent';
  return '/jobs';
}

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [persona, setPersona] = useState<AuthPersona>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '';

  useEffect(() => {
    if (user) {
      navigate(from || getHomePath(user.role), { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    const result = await dispatch(loginThunk({ email, password }));

    if (loginThunk.fulfilled.match(result)) {
      const loggedInUser = result.payload?.user;
      if (loggedInUser?.role) {
        navigate(from || getHomePath(loggedInUser.role), { replace: true });
      }
    }
  };

  const displayError = localError || error;
  const accentBtn =
    persona === 'candidate'
      ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25';
  const accentLink = persona === 'candidate' ? 'text-teal-400' : 'text-indigo-400';

  return (
    <AuthLayout persona={persona} mode="login">
      <AuthBrandLink />

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">
          {persona === 'candidate'
            ? 'Sign in to explore jobs and track your applications.'
            : 'Sign in to manage listings and your hiring pipeline.'}
        </p>
      </div>

      <AuthPersonaTabs value={persona} onChange={setPersona} />

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {displayError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email-address" className="text-slate-200">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <a href="#" className={`text-xs hover:underline ${accentLink}`}>
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={`h-11 w-full gap-2 text-white shadow-lg transition-all ${accentBtn}`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Signing in...
            </>
          ) : (
            <>
              Sign in as {persona === 'candidate' ? 'Job Seeker' : 'Recruiter'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className={`font-semibold hover:underline ${accentLink}`}>
          Create free account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
