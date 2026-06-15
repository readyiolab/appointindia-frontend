import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyApplicationsThunk } from '../../features/applications/applicationsSlice';
import { useSEO } from '../../hooks/useSEO';
import { Badge } from '../../components/ui/badge';
import { FileText, Loader2, Calendar, Building2, ChevronRight, Inbox } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  screening: { label: 'Screening', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  interview_scheduled: { label: 'Interview', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  rejected: { label: 'Rejected', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  hired: { label: 'Hired', color: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
};

const statusOrder = ['applied', 'screening', 'shortlisted', 'interview_scheduled', 'hired'];

export const MyApplications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myApplications, loading } = useAppSelector((s) => s.applications);

  useSEO({
    title: 'My Applications',
    description: 'Track the status of all your job applications on AppointIndia.',
    keywords: 'job applications, track applications, interviews, recruiter status, AppointIndia',
  });

  useEffect(() => {
    dispatch(fetchMyApplicationsThunk());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of all your job applications
        </p>
      </div>

      {myApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-foreground">No applications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start applying to jobs to see your application status here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myApplications.map((app, idx) => {
            const cfg = statusConfig[app.status] || statusConfig.applied;
            const currentStepIdx = statusOrder.indexOf(app.status);
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id || idx}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {app.jobTitle || `Job #${app.jobId.slice(0, 8)}`}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {app.companyName || 'Company'}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${cfg.color}`}>
                    {cfg.label}
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="mt-5 flex items-center gap-0">
                  {statusOrder.map((step, i) => {
                    const isCompleted = !isRejected && currentStepIdx >= i;
                    const isCurrent = !isRejected && currentStepIdx === i;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                              isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : isRejected
                                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                  : 'border-border bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-card' : ''}`}
                          >
                            {i + 1}
                          </div>
                          <span className="mt-1 text-[9px] text-muted-foreground capitalize hidden sm:block">
                            {statusConfig[step]?.label || step}
                          </span>
                        </div>
                        {i < statusOrder.length - 1 && (
                          <div
                            className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${
                              !isRejected && currentStepIdx > i ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Footer Meta */}
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
