import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import {
  fetchRecruiterPipelineThunk,
  updateApplicationStatusThunk,
  type ApplicationData,
} from '../../features/applications/applicationsSlice';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Laptop,
  Loader2,
  Mail,
  MapPin,
  Search,
  User,
  X,
  Users,
  Filter,
} from 'lucide-react';

type Status = ApplicationData['status'];

const COLUMNS: Status[] = ['applied', 'screening', 'shortlisted', 'interview_scheduled', 'hired'];

const statusConfig: Record<
  Status,
  { label: string; headerBg: string; dotColor: string; badge: string }
> = {
  applied: {
    label: 'Applied',
    headerBg: 'bg-blue-500/10 border-blue-500/20',
    dotColor: 'bg-blue-500',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  },
  screening: {
    label: 'Screening',
    headerBg: 'bg-amber-500/10 border-amber-500/20',
    dotColor: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  shortlisted: {
    label: 'Shortlisted',
    headerBg: 'bg-purple-500/10 border-purple-500/20',
    dotColor: 'bg-purple-500',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  },
  interview_scheduled: {
    label: 'Interview',
    headerBg: 'bg-indigo-500/10 border-indigo-500/20',
    dotColor: 'bg-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  },
  hired: {
    label: 'Hired',
    headerBg: 'bg-emerald-500/10 border-emerald-500/20',
    dotColor: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  rejected: {
    label: 'Rejected',
    headerBg: 'bg-red-500/10 border-red-500/20',
    dotColor: 'bg-red-500',
    badge: 'bg-red-500/15 text-red-700 dark:text-red-300',
  },
};

const workModeMeta = {
  remote: { label: 'Remote', icon: Globe },
  hybrid: { label: 'Hybrid', icon: Laptop },
  onsite: { label: 'On-site', icon: Building2 },
} as const;

function getInitials(name?: string) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const RecruiterApplications: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    recruiterPipeline,
    jobSummaries,
    pipelineTotal,
    pipelinePage,
    pipelineTotalPages,
    pipelineLoading,
    error,
  } = useAppSelector((s) => s.applications);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [workMode, setWorkMode] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 450);

  const loadPipeline = useCallback(() => {
    dispatch(
      fetchRecruiterPipelineThunk({
        jobId: jobId || undefined,
        status: (statusFilter as ApplicationData['status']) || undefined,
        workMode: (workMode as 'remote' | 'hybrid' | 'onsite') || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 24,
      })
    );
  }, [dispatch, jobId, statusFilter, workMode, debouncedSearch, page]);

  useEffect(() => {
    const fromUrl = searchParams.get('jobId');
    if (fromUrl) setJobId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  useEffect(() => {
    setPage(1);
  }, [jobId, statusFilter, workMode, debouncedSearch]);

  const selectedJob = useMemo(
    () => jobSummaries.find((j) => j.id === jobId),
    [jobSummaries, jobId]
  );

  const moveToStatus = async (appId: string, newStatus: Status) => {
    setUpdatingId(appId);
    await dispatch(updateApplicationStatusThunk({ id: appId, status: newStatus }));
    setUpdatingId(null);
    loadPipeline();
    if (selectedApp?.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setJobId('');
    setStatusFilter('');
    setWorkMode('');
    setPage(1);
  };

  const hasFilters = Boolean(search || jobId || statusFilter || workMode);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Application Pipeline
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track applicants per job posting • {pipelineTotal} matching applications
          </p>
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Posted jobs — applicant counts per listing */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Your job postings</h2>
          <span className="text-xs text-muted-foreground">Click a job to filter pipeline</span>
        </div>
        {jobSummaries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No jobs posted yet. Post a job to start receiving applications.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setJobId('')}
              className={`shrink-0 rounded-lg border px-4 py-3 text-left transition-all ${
                !jobId
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-border bg-background hover:border-indigo-500/40'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">All jobs</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {jobSummaries.reduce((s, j) => s + j.applicationCount, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">total applicants</p>
            </button>
            {jobSummaries.map((job) => {
              const ModeIcon = workModeMeta[job.workMode as keyof typeof workModeMeta]?.icon || Briefcase;
              const active = jobId === job.id;
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setJobId(active ? '' : job.id)}
                  className={`min-w-[200px] shrink-0 rounded-lg border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-border bg-background hover:border-indigo-500/40'
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{job.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <ModeIcon className="h-3 w-3" />
                    {workModeMeta[job.workMode as keyof typeof workModeMeta]?.label || job.workMode}
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {job.applicationCount}
                    </span>
                    <span className="text-xs text-muted-foreground">applicants</span>
                    {job.hiredCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {job.hiredCount} hired
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedJob && (
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Viewing: {selectedJob.title}</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {selectedJob.applicationCount} total applicants on this post
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filters
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, email, job title..."
              className="pl-9"
            />
          </div>
          <div className="lg:col-span-3">
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {COLUMNS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s].label}
                  </SelectItem>
                ))}
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-5">
            {(['', 'remote', 'hybrid', 'onsite'] as const).map((mode) => {
              const label = mode === '' ? 'All modes' : workModeMeta[mode].label;
              const active = workMode === mode;
              return (
                <Button
                  key={mode || 'all'}
                  type="button"
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  className={active ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  onClick={() => setWorkMode(mode)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Kanban */}
      {pipelineLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {COLUMNS.map((status) => {
            const cfg = statusConfig[status];
            const columnApps = recruiterPipeline.filter((a) => a.status === status);
            return (
              <div
                key={status}
                className="flex w-[280px] shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm"
              >
                <div className={`flex items-center justify-between border-b px-4 py-3 ${cfg.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">
                    {columnApps.length}
                  </span>
                </div>
                <div className="min-h-[220px] space-y-2 p-3">
                  {columnApps.length === 0 ? (
                    <p className="py-12 text-center text-xs text-muted-foreground">No candidates</p>
                  ) : (
                    columnApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="w-full rounded-lg border border-border bg-background p-3 text-left shadow-sm transition hover:border-indigo-500/40 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {getInitials(app.candidateName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {app.candidateName}
                            </p>
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">
                              {app.candidateHeadline}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {app.jobTitle}
                          </Badge>
                          {app.workMode && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {workModeMeta[app.workMode]?.label || app.workMode}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pipelineTotalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {pipelinePage} of {pipelineTotalPages} • {pipelineTotal} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || pipelineLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pipelineTotalPages || pipelineLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Candidate drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
            aria-label="Close panel"
          />
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Candidate profile</h2>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {getInitials(selectedApp.candidateName)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-foreground">{selectedApp.candidateName}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{selectedApp.candidateHeadline}</p>
                  <Badge className={`mt-2 ${statusConfig[selectedApp.status].badge}`}>
                    {statusConfig[selectedApp.status].label}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{selectedApp.candidateEmail || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{selectedApp.jobTitle}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {selectedApp.location || '—'}
                    {selectedApp.workMode && (
                      <span className="ml-2 text-muted-foreground">
                        ({workModeMeta[selectedApp.workMode]?.label})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Applied {formatDate(selectedApp.appliedAt)}</span>
                </div>
                {selectedApp.companyName && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{selectedApp.companyName}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Move to stage
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['applied', 'screening', 'shortlisted', 'interview_scheduled', 'hired', 'rejected'] as Status[]).map(
                    (s) => {
                      const cfg = statusConfig[s];
                      const isCurrent = selectedApp.status === s;
                      return (
                        <Button
                          key={s}
                          variant={isCurrent ? 'default' : 'outline'}
                          size="sm"
                          disabled={isCurrent || updatingId === selectedApp.id}
                          onClick={() => moveToStatus(selectedApp.id, s)}
                          className={`justify-start gap-2 text-xs ${isCurrent ? 'bg-indigo-600' : ''}`}
                        >
                          {updatingId === selectedApp.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                          )}
                          {cfg.label}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
