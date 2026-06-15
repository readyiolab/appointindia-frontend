import React from 'react';
import { Building2, User } from 'lucide-react';
import type { AuthPersona } from './AuthLayout';

interface AuthPersonaTabsProps {
  value: AuthPersona;
  onChange: (value: AuthPersona) => void;
}

const tabs = [
  { value: 'candidate' as const, label: 'Job Seeker', icon: User },
  { value: 'recruiter' as const, label: 'Recruiter', icon: Building2 },
];

export const AuthPersonaTabs: React.FC<AuthPersonaTabsProps> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const selected = value === tab.value;
      return (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
            selected
              ? tab.value === 'candidate'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icon className="h-4 w-4" />
          {tab.label}
        </button>
      );
    })}
  </div>
);

export default AuthPersonaTabs;
