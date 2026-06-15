import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchRecruiterPipelineThunk } from '../../features/applications/applicationsSlice';
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  FolderKanban,
  Plus,
  MapPin,
  Globe,
  Laptop,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const workModeIcon = {
  remote: Globe,
  hybrid: Laptop,
  onsite: Building2,
} as const;

export const AgentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobSummaries, pipelineStats, pipelineTotal, pipelineLoading } = useAppSelector(
    (s) => s.applications
  );

  useEffect(() => {
    dispatch(fetchRecruiterPipelineThunk({ page: 1, limit: 1 }));
  }, [dispatch]);

  const activeJobs = jobSummaries.filter((j) => j.status === 'published').length;
  const totalApplicants = jobSummaries.reduce((s, j) => s + j.applicationCount, 0);
  const hiredCount = jobSummaries.reduce((s, j) => s + j.hiredCount, 0);
  const interviewCount =
    pipelineStats.byStatus?.find((r) => r.status === 'interview_scheduled')?.count ?? 0;

  const stats = [
    {
      label: 'Active Jobs',
      value: String(activeJobs || jobSummaries.length),
      change: `${jobSummaries.length} total postings`,
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Applicants',
      value: String(totalApplicants || pipelineTotal),
      change: 'Across all your jobs',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Interviews',
      value: String(interviewCount),
      change: 'Scheduled stage',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Hired',
      value: String(hiredCount),
      change: totalApplicants ? `${Math.round((hiredCount / totalApplicants) * 100) || 0}% conversion` : 'No hires yet',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  const pipelineStages = [
    { stage: 'Applied', key: 'applied', color: 'bg-blue-500' },
    { stage: 'Screening', key: 'screening', color: 'bg-amber-500' },
    { stage: 'Shortlisted', key: 'shortlisted', color: 'bg-purple-500' },
    { stage: 'Interview', key: 'interview_scheduled', color: 'bg-indigo-500' },
    { stage: 'Hired', key: 'hired', color: 'bg-green-500' },
  ].map((s) => ({
    ...s,
    count: Number(pipelineStats.byStatus?.find((r) => r.status === s.key)?.count || 0),
  }));

  const maxPipeline = Math.max(...pipelineStages.map((p) => p.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Recruiter Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See how many candidates applied to each job you posted
          </p>
        </div>
        <Link to="/agent/post-job">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
            <Plus className="h-4 w-4" /> Post a Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-[11px] text-green-600 dark:text-green-400">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Jobs with applicant counts */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Applications per job</h2>
            <p className="text-xs text-muted-foreground">Live counts from your posted listings</p>
          </div>
          <Link to="/agent/applications">
            <Button variant="outline" size="sm" className="gap-1">
              <FolderKanban className="h-3.5 w-3.5" /> Open pipeline
            </Button>
          </Link>
        </div>
        {pipelineLoading && jobSummaries.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">Loading...</p>
        ) : jobSummaries.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">No jobs yet. Post your first role to receive applications.</p>
            <Link to="/agent/post-job" className="mt-3 inline-block">
              <Button size="sm" className="mt-2">Post a job</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {jobSummaries.map((job) => {
              const ModeIcon = workModeIcon[job.workMode as keyof typeof workModeIcon] || Briefcase;
              return (
                <div key={job.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <ModeIcon className="h-3.5 w-3.5" />
                      <span className="capitalize">{job.workMode}</span>
                      <span>•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {job.applicationCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">applicants</p>
                    </div>
                    {job.hiredCount > 0 && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        {job.hiredCount} hired
                      </Badge>
                    )}
                    <Link to={`/agent/applications?jobId=${job.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Hiring pipeline</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Candidates by stage</p>
          <div className="mt-6 space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">{stage.stage}</span>
                <div className="h-8 flex-1 overflow-hidden rounded-lg bg-muted">
                  <div
                    className={`h-full rounded-lg ${stage.color} transition-all duration-700`}
                    style={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <Link to="/agent/post-job" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" /> Post new job
              </Button>
            </Link>
            <Link to="/agent/applications" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FolderKanban className="h-4 w-4" /> Manage applicants
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
