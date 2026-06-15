import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobDetailsThunk, clearCurrentJob } from '../../features/jobs/jobsSlice';
import {
  applyToJobThunk,
  fetchMyApplicationsThunk,
  clearApplyFeedback,
} from '../../features/applications/applicationsSlice';
import { loginThunk, registerThunk } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Sheet, SheetContent, SheetTitle } from '../../components/ui/sheet';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  X,
  ChevronRight,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  ShieldAlert,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-react';

// Format salary Lacs PA
const formatSalaryLacs = (val?: number) => {
  if (!val) return 'Not disclosed';
  const lacs = val / 100000;
  return `${lacs.toFixed(1)} Lacs PA`;
};

// Mock ratings
const getMockRating = (title: string, company: string) => {
  const code = (title.length + company.length) % 15;
  const rating = (code / 10) + 3.5;
  const reviews = ((title.length * 37) % 800) + 50;
  return { rating: rating.toFixed(1), reviews };
};

export const JobDetails: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Extract ID from slug (it is a 36-char UUID at the end of the slug)
  const jobId = useMemo(() => {
    if (!slug) return '';
    console.log('JobDetails parsing slug:', slug);
    // UUID at the end is 36 characters (composed of 32 hex chars + 4 dashes)
    if (slug.length >= 36) {
      const potentialUuid = slug.substring(slug.length - 36);
      // Validate that it has 4 dashes to make sure it's a UUID
      const dashCount = (potentialUuid.match(/-/g) || []).length;
      if (dashCount === 4) {
        console.log('Parsed jobId from potentialUuid:', potentialUuid);
        return potentialUuid;
      }
    }
    // Fallback: split by dash and take last segment
    const parts = slug.split('-');
    const fallbackId = parts[parts.length - 1] || '';
    console.log('Parsed jobId from fallback segment:', fallbackId);
    return fallbackId;
  }, [slug]);

  const { currentJob, detailLoading, error: jobError } = useAppSelector((s) => s.jobs);
  const { isLoggedIn, user, error: authError, loading: authLoading } = useAuth();
  const { myApplications, applyLoading, applyError, applySuccess } = useAppSelector((s) => s.applications);

  useSEO({
    title: currentJob ? `${currentJob.title} - ${currentJob.companyName || 'AppointIndia'}` : 'Job Details',
    description: currentJob ? `${currentJob.title} vacancy at ${currentJob.companyName || 'AppointIndia'} in ${currentJob.location}. ${currentJob.description.substring(0, 150)}...` : 'View job details and apply online on AppointIndia.',
    keywords: currentJob ? `${currentJob.title}, jobs at ${currentJob.companyName}, ${currentJob.location} jobs, apply online, AppointIndia` : 'jobs, careers, job openings',
    canonicalUrl: currentJob ? `https://appointindia.com/jobs/${jobId}` : undefined,
  });

  // Drawer and Mode States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'login' | 'register'>('login');

  // Drawer Login Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local validation errors inside drawer
  const [drawerError, setDrawerError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobDetailsThunk(jobId));
    }
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'candidate') {
      dispatch(fetchMyApplicationsThunk());
    }
  }, [dispatch, isLoggedIn, user?.role]);

  const appliedJobIds = useMemo(
    () => new Set(myApplications.map((a) => a.jobId)),
    [myApplications]
  );

  const alreadyApplied = useMemo(() => {
    return jobId ? appliedJobIds.has(jobId) : false;
  }, [jobId, appliedJobIds]);

  // Open Drawer triggers
  const handleOpenLoginDrawer = () => {
    setDrawerMode('login');
    setDrawerError(null);
    dispatch(clearApplyFeedback());
    setDrawerOpen(true);
  };

  const handleOpenRegisterDrawer = () => {
    setDrawerMode('register');
    setDrawerError(null);
    dispatch(clearApplyFeedback());
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDrawerError(null);
  };

  // Submit Drawer Form (Handles Login or Register + Auto apply on success)
  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError(null);

    if (drawerMode === 'login') {
      if (!email || !password) {
        setDrawerError('Please enter email and password.');
        return;
      }

      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(result)) {
        const loggedInUser = result.payload?.user;
        if (loggedInUser?.role === 'candidate') {
          // Immediately proceed to apply for the job!
          const applyRes = await dispatch(applyToJobThunk({ jobId }));
          if (applyToJobThunk.fulfilled.match(applyRes)) {
            dispatch(fetchMyApplicationsThunk());
          }
          handleCloseDrawer();
        } else {
          // Logged in but not candidate (e.g. recruiter)
          handleCloseDrawer();
        }
      } else {
        setDrawerError(result.payload as string || 'Authentication failed. Please check credentials.');
      }
    } else {
      // Register Mode
      if (!email || !password || !confirmPassword) {
        setDrawerError('Please fill in all registration fields.');
        return;
      }
      if (password.length < 8) {
        setDrawerError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setDrawerError('Passwords do not match.');
        return;
      }

      const result = await dispatch(registerThunk({ email, password, role: 'candidate' }));
      if (registerThunk.fulfilled.match(result)) {
        // Immediately apply
        const applyRes = await dispatch(applyToJobThunk({ jobId }));
        if (applyToJobThunk.fulfilled.match(applyRes)) {
          dispatch(fetchMyApplicationsThunk());
        }
        handleCloseDrawer();
      } else {
        setDrawerError(result.payload as string || 'Registration failed. Try again.');
      }
    }
  };

  // Main Apply Button (for logged-in candidate)
  const handleDirectApply = async () => {
    if (!jobId) return;
    dispatch(clearApplyFeedback());
    const result = await dispatch(applyToJobThunk({ jobId }));
    if (applyToJobThunk.fulfilled.match(result)) {
      dispatch(fetchMyApplicationsThunk());
    }
  };

  if (detailLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Fetching job detail specifications...</p>
        </div>
      </div>
    );
  }

  if (jobError || !currentJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="h-14 w-14 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Failed to load job</h2>
        <p className="text-xs text-slate-500 mt-2">
          {jobError || 'The job listing you are looking for might have been closed or expired.'}
        </p>
        <Link to="/jobs">
          <Button className="mt-6 bg-primary hover:bg-secondary text-white font-bold text-xs">
            Back to Job Board
          </Button>
        </Link>
      </div>
    );
  }

  const { rating, reviews } = getMockRating(currentJob.title, currentJob.companyName || 'AppointIndia');
  const showApplySection = !isLoggedIn || user?.role === 'candidate';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Job Description and Details */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Top Header Details Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs relative">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
              {currentJob.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
              <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                {currentJob.companyName || 'Multycomm Interactive Media'}
              </span>
              <div className="flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 rounded text-[10px] font-bold gap-0.5">
                <span>{rating}</span>
                <Star className="h-2.5 w-2.5 fill-amber-500/20" />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 border-l border-slate-200 dark:border-zinc-800 pl-3">
                {reviews} Reviews
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-slate-100 dark:border-zinc-800/80 mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Experience</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {currentJob.minExperienceYears ?? 0} - {currentJob.maxExperienceYears ?? 15} Years
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Salary</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {formatSalaryLacs(currentJob.minSalary)} - {formatSalaryLacs(currentJob.maxSalary)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Location</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {currentJob.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Tags & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Meta information */}
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>Posted: <strong className="text-slate-600 dark:text-zinc-300">2 Days Ago</strong></span>
                <span>Openings: <strong className="text-slate-600 dark:text-zinc-300">1</strong></span>
                <span>Applicants: <strong className="text-slate-600 dark:text-zinc-300">13</strong></span>
              </div>

              {/* Apply Action Buttons */}
              <div className="flex items-center gap-3">
                {applySuccess && (
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Application Submitted!
                  </div>
                )}

                {showApplySection && !applySuccess && (
                  <>
                    {!isLoggedIn ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenRegisterDrawer}
                          className="px-5 py-2 text-xs font-bold text-primary border border-primary rounded-full hover:bg-muted dark:text-primary-foreground dark:border-primary transition-colors"
                        >
                          Register to apply
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenLoginDrawer}
                          className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-full shadow-md transition-colors"
                        >
                          Login to apply
                        </button>
                      </div>
                    ) : alreadyApplied ? (
                      <button
                        disabled
                        className="px-6 py-2 text-xs font-bold text-teal-600 bg-teal-500/10 rounded-full flex items-center gap-1.5 cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Applied
                      </button>
                    ) : (
                      <button
                        onClick={handleDirectApply}
                        disabled={applyLoading}
                        className="px-6 py-2 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-full shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {applyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        {applyLoading ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </>
                )}

                {!showApplySection && (
                  <span className="text-xs text-slate-400 italic">
                    Only seeker accounts can apply to jobs.
                  </span>
                )}
              </div>

            </div>

          </div>

          {/* Job Description details */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-widest mb-4">
                Job Description
              </h2>
              <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap space-y-2">
                {currentJob.description}
              </div>
            </div>

            {/* Structured Role Details */}
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-4">
                Role Characteristics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Role</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentJob.title}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Industry Type</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">IT Services & Consulting</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">Engineering - Software & QA</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Employment Type</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                    {currentJob.jobType?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                  <span className="text-slate-400">Work Mode</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                    {currentJob.workMode} (Office location: {currentJob.location})
                  </span>
                </div>
              </div>
            </div>

            {/* Education details */}
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Education
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                <strong className="text-slate-800 dark:text-zinc-100">UG:</strong> Any Graduate, B.Tech/B.E. in Computer Science or related fields.
              </p>
            </div>

            {/* Key Skills */}
            <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
                Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {['VoIP', 'SIP', 'RTP', 'Telephony', 'Engineering', 'Software', 'Support'].map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer text-slate-700 dark:text-zinc-300 px-3.5 py-1 rounded-full text-xs transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Corporate Details & Fraud Alert */}
        <div className="lg:col-span-4 space-y-6">

          {/* Company profile summary */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <h2 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-widest mb-4">
              Company Overview
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-800 pb-2">
                <span className="text-slate-400">Company</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {currentJob.companyName || 'Multycomm Interactive Media'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-800 pb-2">
                <span className="text-slate-400">Industry</span>
                <span className="font-semibold">IT Telecom</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-800 pb-2">
                <span className="text-slate-400">Company Size</span>
                <span className="font-semibold">51-200 Employees</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold">{currentJob.location}</span>
              </div>
            </div>
          </div>

          {/* Safety Disclaimer Card */}
          <div className="bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Beware of Imposters
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              AppointIndia does not charge candidates any fees for job placements or recruitment processes. Do not share financial info or pay money to anybody claiming to represent this organization.
            </p>
            <a href="#" className="block text-[10px] font-bold text-primary dark:text-accent hover:underline">
              Report suspicious activity &gt;
            </a>
          </div>

        </div>

      </div>

      {/* Sliding login drawer using Shadcn Sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 p-0 shadow-2xl"
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
              <div>
                <SheetTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {drawerMode === 'login' ? 'Login' : 'Create Account'}
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body (Form) */}
            <form onSubmit={handleDrawerSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

              {/* Toggle Link */}
              <div className="flex items-center justify-between text-xs pb-2">
                <span className="text-slate-500">
                  {drawerMode === 'login' ? 'New to AppointIndia?' : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerMode(drawerMode === 'login' ? 'register' : 'login');
                    setDrawerError(null);
                  }}
                  className="font-bold text-primary dark:text-accent hover:underline"
                >
                  {drawerMode === 'login' ? 'Register for free' : 'Login instead'}
                </button>
              </div>

              {/* Error alerts */}
              {drawerError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{drawerError}</span>
                </div>
              )}

              {applyError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="drawer-email" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Email ID / Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="drawer-email"
                    type="email"
                    required
                    placeholder="Enter email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 text-xs bg-transparent text-slate-900 dark:text-white outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="drawer-password" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Password
                  </Label>
                  {drawerMode === 'login' && (
                    <a href="#" className="text-[10px] text-primary dark:text-accent hover:underline">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="drawer-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-10 text-xs bg-transparent text-slate-900 dark:text-white outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Only for Register Mode) */}
              {drawerMode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="drawer-confirm" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="drawer-confirm"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 text-xs bg-transparent text-slate-900 dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-10 bg-primary hover:bg-secondary text-white font-bold text-xs shadow-md transition-all mt-4"
              >
                {authLoading ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : drawerMode === 'login' ? (
                  'Login'
                ) : (
                  'Create Seeker Account'
                )}
              </Button>

              {/* Social logins */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute border-t border-slate-100 dark:border-zinc-800/80 w-full" />
                <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Or
                </span>
              </div>

              <button
                type="button"
                className="w-full h-10 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.54 5.54 0 0 1 8.45 13a5.54 5.54 0 0 1 5.54-5.514c2.25 0 3.882.935 4.8 1.815l3.22-3.22C19.98 4.09 17.25 3 14 3A9.99 9.99 0 0 0 4 13a9.99 9.99 0 0 0 10 10c5.54 0 10-4.46 10-10a9.6 9.6 0 0 0-.16-1.715Z"
                  />
                </svg>
                Sign in with Google
              </button>

            </form>

          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default JobDetails;
