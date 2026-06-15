import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchJobsThunk } from '../../features/jobs/jobsSlice';
import { fetchMyApplicationsThunk } from '../../features/applications/applicationsSlice';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  ChevronRight,
  Filter,
  CheckCircle2,
  Loader2,
  Bookmark,
  Star,
  Settings,
  Sparkles,
} from 'lucide-react';

// Helper to format salary in Lacs PA (Per Annum)
const formatSalaryLacs = (val?: number) => {
  if (!val) return 'Not disclosed';
  const lacs = val / 100000;
  return `${lacs.toFixed(1)} Lacs PA`;
};

// Generate deterministic ratings based on job info
const getMockRating = (title: string, company: string) => {
  const code = (title.length + company.length) % 15;
  const rating = (code / 10) + 3.5;
  const reviews = ((title.length * 37) % 800) + 50;
  return { rating: rating.toFixed(1), reviews };
};

// Generate slug for a job
const getJobSlug = (job: any) => {
  const clean = (str: string) => {
    if (!str) return 'info';
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };
  const title = clean(job.title);
  const company = clean(job.companyName || 'company');
  const loc = clean(job.location);
  const exp = `${job.minExperienceYears ?? 0}-to-${job.maxExperienceYears ?? 15}-years`;
  return `${title}-${company}-${loc}-${exp}-${job.id}`;
};

export const JobListings: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useSEO({
    title: 'Search Jobs & Openings',
    description: 'Find active job openings across Bengaluru, Pune, Hyderabad, Noida, and Gurgaon on AppointIndia. Search by role, skills, experience, and department.',
    keywords: 'job listings, search jobs, software jobs, engineer jobs, work from home jobs, AppointIndia',
    canonicalUrl: 'https://appointindia.com/jobs',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, loading } = useAppSelector((s) => s.jobs);
  const { isLoggedIn, user } = useAuth();
  const { myApplications } = useAppSelector((s) => s.applications);

  // Read URL search params
  const urlQuery = searchParams.get('query') || '';
  const urlExperience = searchParams.get('experience') || '';
  const urlLocation = searchParams.get('location') || '';

  // Local Search Input States
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [locationInput, setLocationInput] = useState(urlLocation);

  // Sync state if URL changes
  useEffect(() => {
    setSearchQuery(urlQuery);
    setLocationInput(urlLocation);
  }, [urlQuery, urlLocation]);

  // Sidebar Filter States
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    urlLocation ? [urlLocation] : []
  );
  const [selectedExperience, setSelectedExperience] = useState<string>(urlExperience || '');
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Applied job IDs Set
  const appliedJobIds = useMemo(
    () => new Set(myApplications.map((a) => a.jobId)),
    [myApplications]
  );

  useEffect(() => {
    dispatch(searchJobsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'candidate') {
      dispatch(fetchMyApplicationsThunk());
    }
  }, [dispatch, isLoggedIn, user?.role]);

  // Experience Options
  const expOptions = [
    { label: 'Any Experience', value: '' },
    { label: 'Fresher (0 Years)', value: '0' },
    { label: '1-2 Years', value: '1-2' },
    { label: '2-5 Years', value: '2-5' },
    { label: '5-8 Years', value: '5-8' },
    { label: '8-12 Years', value: '8-12' },
    { label: '12+ Years', value: '12+' },
  ];

  // Location list derived from database jobs or common ones
  const locationOptions = ['Bengaluru', 'Hyderabad', 'Pune', 'New Delhi', 'Mumbai', 'Noida', 'Gurgaon', 'Gorakhpur'];

  // Salary options
  const salaryOptions = [
    { label: '0-3 Lakhs', min: 0, max: 300000 },
    { label: '3-6 Lakhs', min: 300000, max: 600000 },
    { label: '6-10 Lakhs', min: 600000, max: 1000000 },
    { label: '10-15 Lakhs', min: 1000000, max: 1500000 },
    { label: '15+ Lakhs', min: 1500000, max: 99999999 },
  ];

  // Work Mode Options
  const modeOptions = [
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Onsite / Office', value: 'onsite' },
  ];

  // Job Type Options
  const typeOptions = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Part Time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
  ];

  // Department Options
  const departmentOptions = ['Engineering', 'Sales / Business Development', 'Marketing', 'Human Resources', 'Finance & Accounting'];

  // Handle Main Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.append('query', searchQuery);
    if (locationInput) {
      newParams.append('location', locationInput);
      setSelectedLocations([locationInput]);
    } else {
      setSelectedLocations([]);
    }
    if (selectedExperience) newParams.append('experience', selectedExperience);
    setSearchParams(newParams);
  };

  // Filter items in memory
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      // 1. Text Search Filter
      const text = searchQuery.toLowerCase();
      const matchesText =
        !text ||
        job.title.toLowerCase().includes(text) ||
        (job.description || '').toLowerCase().includes(text) ||
        job.location.toLowerCase().includes(text);

      // 2. Location Checkboxes
      const matchesLocations =
        selectedLocations.length === 0 ||
        selectedLocations.some((loc) =>
          job.location.toLowerCase().includes(loc.toLowerCase())
        );

      // 3. Experience Filter
      let matchesExperience = true;
      if (selectedExperience) {
        const minExp = job.minExperienceYears ?? 0;
        const maxExp = job.maxExperienceYears ?? 15;
        if (selectedExperience === '0') {
          matchesExperience = minExp === 0;
        } else if (selectedExperience === '1-2') {
          matchesExperience = minExp <= 2 && maxExp >= 1;
        } else if (selectedExperience === '2-5') {
          matchesExperience = minExp <= 5 && maxExp >= 2;
        } else if (selectedExperience === '5-8') {
          matchesExperience = minExp <= 8 && maxExp >= 5;
        } else if (selectedExperience === '8-12') {
          matchesExperience = minExp <= 12 && maxExp >= 8;
        } else if (selectedExperience === '12+') {
          matchesExperience = maxExp >= 12;
        }
      }

      // 4. Salary Filter
      let matchesSalary = true;
      if (selectedSalaries.length > 0) {
        matchesSalary = selectedSalaries.some((rangeLabel) => {
          const opt = salaryOptions.find((o) => o.label === rangeLabel);
          if (!opt) return false;
          const minSal = job.minSalary ?? 0;
          const maxSal = job.maxSalary ?? 99999999;
          return minSal <= opt.max && maxSal >= opt.min;
        });
      }

      // 5. Work Mode Checkboxes
      const matchesMode =
        selectedModes.length === 0 || selectedModes.includes(job.workMode);

      // 6. Job Type Checkboxes
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(job.jobType);

      // 7. Department Checkboxes
      const matchesDepartment =
        selectedDepartments.length === 0 ||
        selectedDepartments.some((dept) =>
          // Fallback matching logic on job descriptions/titles
          job.title.toLowerCase().includes(dept.toLowerCase()) ||
          job.description.toLowerCase().includes(dept.toLowerCase())
        );

      return (
        matchesText &&
        matchesLocations &&
        matchesExperience &&
        matchesSalary &&
        matchesMode &&
        matchesType &&
        matchesDepartment
      );
    });
  }, [
    jobs,
    searchQuery,
    selectedLocations,
    selectedExperience,
    selectedSalaries,
    selectedModes,
    selectedTypes,
    selectedDepartments,
  ]);

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedExperience('');
    setSelectedSalaries([]);
    setSelectedModes([]);
    setSelectedTypes([]);
    setSelectedDepartments([]);
    setSearchQuery('');
    setLocationInput('');
    setSearchParams(new URLSearchParams());
  };

  const totalFiltersCount =
    selectedLocations.length +
    (selectedExperience ? 1 : 0) +
    selectedSalaries.length +
    selectedModes.length +
    selectedTypes.length +
    selectedDepartments.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">

      {/* Header Search Box (Naukri Search Bar layout) */}
      <div className="mb-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-xl p-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1 bg-slate-50 dark:bg-zinc-950">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search jobs by role, skills, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none py-1.5"
            />
          </div>
          <div className="relative flex-1 w-full flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1 bg-slate-50 dark:bg-zinc-950">
            <MapPin className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search location..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none py-1.5"
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full md:w-36 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              {expOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              className="w-full md:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Main Content Area: Double-Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Filters Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-blue-600" /> All Filters
              </span>
              {totalFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Experience Radio Selector */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Experience
              </h3>
              <div className="space-y-1.5">
                {expOptions.slice(1).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="experience-sidebar"
                      checked={selectedExperience === opt.value}
                      onChange={() => setSelectedExperience(opt.value)}
                      className="accent-blue-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Location Checkboxes */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Location
              </h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {locationOptions.map((loc) => {
                  const isChecked = selectedLocations.includes(loc);
                  return (
                    <label
                      key={loc}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedLocations(
                            isChecked
                              ? selectedLocations.filter((l) => l !== loc)
                              : [...selectedLocations, loc]
                          );
                        }}
                        className="accent-blue-600"
                      />
                      {loc}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Salary Checkboxes */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Salary (PA)
              </h3>
              <div className="space-y-1.5">
                {salaryOptions.map((sal) => {
                  const isChecked = selectedSalaries.includes(sal.label);
                  return (
                    <label
                      key={sal.label}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedSalaries(
                            isChecked
                              ? selectedSalaries.filter((s) => s !== sal.label)
                              : [...selectedSalaries, sal.label]
                          );
                        }}
                        className="accent-blue-600"
                      />
                      {sal.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Work Mode Checkboxes */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Work Mode
              </h3>
              <div className="space-y-1.5">
                {modeOptions.map((mode) => {
                  const isChecked = selectedModes.includes(mode.value);
                  return (
                    <label
                      key={mode.value}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedModes(
                            isChecked
                              ? selectedModes.filter((m) => m !== mode.value)
                              : [...selectedModes, mode.value]
                          );
                        }}
                        className="accent-blue-600"
                      />
                      {mode.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Department Checkboxes */}
            <div className="space-y-2 mb-2">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Department
              </h3>
              <div className="space-y-1.5">
                {departmentOptions.map((dept) => {
                  const isChecked = selectedDepartments.includes(dept);
                  return (
                    <label
                      key={dept}
                      className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedDepartments(
                            isChecked
                              ? selectedDepartments.filter((d) => d !== dept)
                              : [...selectedDepartments, dept]
                          );
                        }}
                        className="accent-blue-600"
                      />
                      {dept}
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Middle Column: Job Cards List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              1 - {filteredJobs.length} of {filteredJobs.length} Jobs
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              Sort by: <strong className="text-slate-800 dark:text-white">Relevance</strong>
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-slate-500">Loading published jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs text-center px-4">
              <Briefcase className="h-12 w-12 text-slate-300 dark:text-zinc-700 mb-4" />
              <h3 className="font-bold text-base text-slate-800 dark:text-zinc-200">No matching jobs found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try widening your search terms, modifying locations, or resetting filters to see more results.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job: any) => {
                const { rating, reviews } = getMockRating(job.title, job.companyName || 'AppointIndia');
                const isApplied = appliedJobIds.has(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/job-listings/${getJobSlug(job)}`)}
                    className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200 rounded-xl p-5 cursor-pointer relative"
                  >

                    {/* Header: Title & Company info */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {job.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                            {job.companyName || 'Multycomm Interactive Media'}
                          </span>
                          <div className="flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 rounded text-[10px] font-bold gap-0.5">
                            <span>{rating}</span>
                            <Star className="h-2.5 w-2.5 fill-amber-500/20" />
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            ({reviews} Reviews)
                          </span>
                        </div>
                      </div>

                      {/* Mock Company Logo Placeholder */}
                      <div className="h-10 w-10 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">
                          {(job.companyName || 'M')[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Job metadata list: Exp, Salary, Loc */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 mb-3.5">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        {job.minExperienceYears ?? 0} - {job.maxExperienceYears ?? 15} Yrs
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        {formatSalaryLacs(job.minSalary)} - {formatSalaryLacs(job.maxSalary)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    </div>

                    {/* Job Description preview */}
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3.5">
                      {job.description || 'No job description provided. Click to view additional qualification criteria and key functional details.'}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {['Software', 'Engineering', job.jobType?.replace('_', ' '), job.workMode].filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer card items: days ago & save button */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                        Posted {new Date(job.postedAt || job.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>

                      <div className="flex items-center gap-2">
                        {isApplied && (
                          <span className="text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Applied
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // bookmark action placeholder
                          }}
                          className="p-1 rounded-full text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Promotional Column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Featured Companies Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> Featured Companies
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Conduent', 'Virtusa', 'OpenText', 'Fiserv', 'TechM', 'HCL'].map((comp, i) => (
                <div
                  key={comp}
                  className="p-2 border border-slate-100 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-zinc-950 hover:bg-slate-50 hover:scale-105 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {comp}
                  </span>
                  <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5 mt-0.5">
                    {(4 + (i % 5) / 10).toFixed(1)} <Star className="h-2 w-2 fill-amber-500" />
                  </span>
                </div>
              ))}
            </div>
            <a href="#" className="block text-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-4">
              View All Featured Companies
            </a>
          </div>

          {/* Naukri FastForward Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full w-max text-[9px] font-extrabold uppercase tracking-wider mb-3">
              FastForward
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-sm leading-tight">
              Get 3X more profile views from recruiters
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Increase your chances of recruiter callbacks with custom professional resume building.
            </p>
            <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors">
              Boost Profile Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default JobListings;
