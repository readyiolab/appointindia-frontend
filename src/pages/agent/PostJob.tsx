import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createJobThunk } from '../../features/jobs/jobsSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Briefcase, MapPin, DollarSign, Clock, ChevronRight, ChevronLeft,
  Loader2, CheckCircle2, AlertCircle, Globe, Laptop, Building,
} from 'lucide-react';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-Time', icon: Clock },
  { value: 'part_time', label: 'Part-Time', icon: Clock },
  { value: 'contract', label: 'Contract', icon: Briefcase },
  { value: 'internship', label: 'Internship', icon: Briefcase },
  { value: 'freelance', label: 'Freelance', icon: Globe },
] as const;

const WORK_MODES = [
  { value: 'remote', label: 'Remote', icon: Globe },
  { value: 'hybrid', label: 'Hybrid', icon: Laptop },
  { value: 'onsite', label: 'On-site', icon: Building },
] as const;

const STEPS = ['Job Details', 'Location & Type', 'Compensation & Requirements', 'Review'];

export const PostJob: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.jobs);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    jobType: 'full_time' as string,
    workMode: 'onsite' as string,
    minSalary: '',
    maxSalary: '',
    minExperienceYears: '',
    maxExperienceYears: '',
    expiresAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const next = () => {
    setError(null);
    if (step === 0 && (!form.title || form.title.length < 5)) {
      setError('Job title must be at least 5 characters');
      return;
    }
    if (step === 0 && (!form.description || form.description.length < 20)) {
      setError('Description must be at least 20 characters');
      return;
    }
    if (step === 1 && (!form.location || form.location.length < 2)) {
      setError('Location is required');
      return;
    }
    if (step === 2 && !form.expiresAt) {
      setError('Expiry date is required');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        location: form.location,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        jobType: form.jobType,
        workMode: form.workMode,
        minSalary: form.minSalary ? Number(form.minSalary) : undefined,
        maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
        minExperienceYears: form.minExperienceYears ? Number(form.minExperienceYears) : undefined,
        maxExperienceYears: form.maxExperienceYears ? Number(form.maxExperienceYears) : undefined,
        expiresAt: new Date(form.expiresAt).toISOString(),
      };
      const action = await dispatch(createJobThunk(payload));
      if (createJobThunk.fulfilled.match(action)) {
        navigate('/agent');
      } else {
        setError((action.payload as string) || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Post a New Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a compelling job listing to attract top candidates
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  i < step
                    ? 'border-primary bg-primary text-primary-foreground'
                    : i === step
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background'
                      : 'border-border text-muted-foreground'
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="mt-1.5 text-[10px] text-muted-foreground hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Step 0: Job Details */}
        {step === 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={8} placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..." className="resize-none" />
              <p className="text-xs text-muted-foreground text-right">{form.description.length} characters</p>
            </div>
          </div>
        )}

        {/* Step 1: Location & Type */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="Mumbai, India" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={form.country} onChange={handleChange} placeholder="India" />
              </div>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label>Employment Type *</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {JOB_TYPES.map((t) => {
                  const Icon = t.icon;
                  const selected = form.jobType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, jobType: t.value }))}
                      className={`flex flex-col items-center rounded-lg border-2 px-3 py-3 text-xs font-medium transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <Label>Work Mode *</Label>
              <div className="grid grid-cols-3 gap-3">
                {WORK_MODES.map((m) => {
                  const Icon = m.icon;
                  const selected = form.workMode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, workMode: m.value }))}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Compensation */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="minSalary">Min Salary (₹)</Label>
                <Input id="minSalary" name="minSalary" type="number" min={0} value={form.minSalary} onChange={handleChange} placeholder="e.g. 800000" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxSalary">Max Salary (₹)</Label>
                <Input id="maxSalary" name="maxSalary" type="number" min={0} value={form.maxSalary} onChange={handleChange} placeholder="e.g. 1500000" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minExperienceYears">Min Experience (years)</Label>
                <Input id="minExperienceYears" name="minExperienceYears" type="number" min={0} value={form.minExperienceYears} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxExperienceYears">Max Experience (years)</Label>
                <Input id="maxExperienceYears" name="maxExperienceYears" type="number" min={0} value={form.maxExperienceYears} onChange={handleChange} placeholder="15" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="expiresAt">Listing Expires On *</Label>
              <Input id="expiresAt" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-semibold text-foreground">Review Your Listing</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium text-foreground">{form.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium text-foreground">{form.location}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground capitalize">{form.jobType.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-medium text-foreground capitalize">{form.workMode}</span></div>
              {form.minSalary && <div className="flex justify-between"><span className="text-muted-foreground">Salary Range</span><span className="font-medium text-foreground">₹{Number(form.minSalary).toLocaleString()} – ₹{Number(form.maxSalary).toLocaleString()}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span className="font-medium text-foreground">{form.expiresAt}</span></div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Description Preview</p>
              <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 max-h-40 overflow-y-auto">{form.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="gap-1 bg-green-600 hover:bg-green-700 text-white shadow-lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? 'Publishing...' : 'Publish Job'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostJob;
