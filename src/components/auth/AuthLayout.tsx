import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, Sparkles } from 'lucide-react';

export type AuthPersona = 'candidate' | 'recruiter';

const personaContent: Record<
  AuthPersona,
  {
    image: string;
    badge: string;
    title: string;
    subtitle: string;
    points: string[];
    accent: string;
    glow: string;
  }
> = {
  candidate: {
    image: '/auth/candidate-hero.png',
    badge: 'For Job Seekers',
    title: 'Land the role you deserve',
    subtitle:
      'Browse verified openings, track applications, and build a profile recruiters trust.',
    points: ['Smart job matching', 'One-click applications', 'Interview updates'],
    accent: 'from-teal-500 to-emerald-600',
    glow: 'bg-teal-500/20',
  },
  recruiter: {
    image: '/auth/recruiter-hero.png',
    badge: 'For Recruiters',
    title: 'Hire faster with confidence',
    subtitle:
      'Publish roles, manage your pipeline, and connect with qualified candidates across India.',
    points: ['Post jobs in minutes', 'Applicant pipeline', 'Trusted employer brand'],
    accent: 'from-indigo-500 to-violet-600',
    glow: 'bg-indigo-500/20',
  },
};

interface AuthLayoutProps {
  persona: AuthPersona;
  mode: 'login' | 'register';
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ persona, mode, children }) => {
  const content = personaContent[persona];

  return (
    <div className="min-h-dvh bg-slate-950 text-white lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      {/* Hero panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <img
          src={content.image}
          alt={content.badge}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />
        <div className={`absolute inset-0 bg-gradient-to-br ${content.accent} opacity-25 mix-blend-multiply`} />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">AppointIndia</p>
              <p className="text-xs text-white/70">India&apos;s trusted job platform</p>
            </div>
          </div>

          <div className="max-w-lg space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {content.badge}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">{content.title}</h1>
            <p className="text-base leading-relaxed text-white/85">{content.subtitle}</p>
            <ul className="space-y-3">
              {content.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-white/90">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${content.glow} backdrop-blur-sm`}>
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">
            {mode === 'login' ? 'Secure sign-in' : 'Free to join'} · Encrypted · Verified employers
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex min-h-dvh flex-col justify-center overflow-y-auto px-4 py-10 sm:px-8 lg:min-h-0 lg:px-12 xl:px-16">
        <div className={`pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full ${content.glow} blur-3xl`} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        {/* Mobile hero strip */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 lg:hidden">
          <img src={content.image} alt="" className="h-40 w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-semibold text-teal-300">{content.badge}</p>
            <p className="text-lg font-bold">{content.title}</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">{children}</div>

        <p className="relative mx-auto mt-8 max-w-md text-center text-xs text-slate-500">
          By continuing, you agree to AppointIndia&apos;s terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

export const AuthBrandLink: React.FC = () => (
  <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
    <Briefcase className="h-4 w-4" />
    Back to home
  </Link>
);

export default AuthLayout;
