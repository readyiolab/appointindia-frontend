import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Building2,
  Package,
  CheckSquare,
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Database,
  Landmark,
  LineChart,
} from 'lucide-react';

interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  query: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useSEO({
    title: 'Find Your Dream Job',
    description: 'Explore over 5 lakh+ jobs, MNC opportunities, supply chain jobs, and data science roles on AppointIndia. Your next career move starts here.',
    keywords: 'jobs, recruitment, hiring, resume, MNC jobs, careers, job portal, AppointIndia',
    canonicalUrl: 'https://appointindia.com',
  });

  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  // Redirect recruiters/admins to their dashboard when they visit the home page
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'recruiter' || user.role === 'company_admin') {
        navigate('/agent', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (skills) params.append('query', skills);
    if (experience) params.append('experience', experience);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const categories: CategoryItem[] = [
    { name: 'MNC', icon: <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />, query: 'MNC' },
    { name: 'Supply Chain', icon: <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />, query: 'Supply Chain' },
    { name: 'Project Mgmt', icon: <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, query: 'Project' },
    { name: 'Startup', icon: <Rocket className="h-5 w-5 text-rose-600 dark:text-rose-400" />, query: 'Startup' },
    { name: 'Marketing', icon: <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, query: 'Marketing' },
    { name: 'HR', icon: <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />, query: 'HR' },
    { name: 'Sales', icon: <DollarSign className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />, query: 'Sales' },
    { name: 'Data Science', icon: <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />, query: 'Data Science' },
    { name: 'Banking & Fin', icon: <Landmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />, query: 'Banking' },
    { name: 'Analytics', icon: <LineChart className="h-5 w-5 text-orange-600 dark:text-orange-400" />, query: 'Analytics' },
  ];

  const handleCategoryClick = (categoryQuery: string) => {
    navigate(`/jobs?query=${encodeURIComponent(categoryQuery)}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center py-10 px-4 font-sans bg-radial from-slate-50 to-slate-100/50 dark:from-zinc-900 dark:to-zinc-950">

      {/* Hero Header */}
      <div className="text-center space-y-3 mb-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Find your dream job now
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          5 lakh+ jobs for you to explore
        </p>
      </div>

      {/* Main Search Panel */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-zinc-950/50 rounded-2xl md:rounded-full p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 md:gap-0"
      >
        {/* Skills/Designations input */}
        <div className="relative flex-1 w-full flex items-center px-4">
          <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Enter skills / designations / companies"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm md:text-base py-2"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Experience Dropdown */}
        <div className="relative w-full md:w-56 flex items-center px-4">
          <Briefcase className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-transparent text-slate-700 dark:text-zinc-300 outline-none text-sm md:text-base py-2 cursor-pointer appearance-none"
          >
            <option value="">Select experience</option>
            <option value="0">Fresher (0 years)</option>
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="4">4 Years</option>
            <option value="5">5 Years</option>
            <option value="7">7 Years</option>
            <option value="10">10+ Years</option>
          </select>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Location input */}
        <div className="relative w-full md:w-64 flex items-center px-4">
          <MapPin className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm md:text-base py-2"
          />
        </div>

        {/* Search button */}
        <Button
          type="submit"
          className="w-full md:w-auto px-8 py-6 rounded-xl md:rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 shrink-0"
        >
          Search
        </Button>
      </form>

      {/* Category Badges Grid */}
      <div className="w-full max-w-5xl mt-12">
        <h2 className="text-center text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
          Popular categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(cat.query)}
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all group duration-200 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  {cat.name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
