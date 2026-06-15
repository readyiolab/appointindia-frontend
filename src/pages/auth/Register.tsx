import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerThunk } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../app/hooks';
import { AuthLayout, AuthBrandLink, type AuthPersona } from '../../components/auth/AuthLayout';
import { AuthPersonaTabs } from '../../components/auth/AuthPersonaTabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

function getHomePath(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter' || role === 'company_admin') return '/agent';
  return '/jobs';
}

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, error, loading } = useAuth();
  const navigate = useNavigate();

  const [persona, setPersona] = useState<AuthPersona>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const role = persona;

  useEffect(() => {
    if (user) {
      navigate(getHomePath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !confirmPassword) {
      setLocalError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const result = await dispatch(registerThunk({ email, password, role }));

    if (registerThunk.fulfilled.match(result)) {
      const registeredUser = result.payload?.user;
      if (registeredUser?.role) {
        navigate(getHomePath(registeredUser.role), { replace: true });
      }
    }
  };

  const displayError =
    localError ||
    (error === 'User already exists'
      ? 'This email is already registered. Please sign in instead.'
      : error);

  const accentBtn =
    persona === 'candidate'
      ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25';
  const accentLink = persona === 'candidate' ? 'text-teal-400' : 'text-indigo-400';

  const passwordStrength =
    password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) ? 4
    : password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) ? 3
    : password.length >= 8 ? 2
    : password.length > 0 ? 1
    : 0;

  return (
    <AuthLayout persona={persona} mode="register">
      <AuthBrandLink />

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="mt-2 text-sm text-slate-400">
          {persona === 'candidate'
            ? 'Join thousands of professionals finding roles across India.'
            : 'Start hiring with a trusted recruiter workspace.'}
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
            <Label htmlFor="reg-email" className="text-slate-200">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500"
                placeholder="Min. 8 characters"
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

          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm" className="text-slate-200">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                id="reg-confirm"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-500"
                placeholder="Repeat password"
              />
            </div>
          </div>
        </div>

        {password.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => {
                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
                return (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= passwordStrength ? colors[passwordStrength - 1] : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              {passwordStrength < 2 ? 'Too short' : passwordStrength < 4 ? 'Good password' : 'Strong password'}
            </p>
          </div>
        )}

        <ul className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          {['Free forever to start', 'Verified platform', 'Secure data'].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className={`h-3.5 w-3.5 ${accentLink}`} />
              {item}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={loading}
          className={`h-11 w-full gap-2 text-white shadow-lg transition-all ${accentBtn}`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              Join as {persona === 'candidate' ? 'Job Seeker' : 'Recruiter'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className={`font-semibold hover:underline ${accentLink}`}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
