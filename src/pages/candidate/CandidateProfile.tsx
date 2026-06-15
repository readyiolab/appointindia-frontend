import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  User, MapPin, Briefcase, DollarSign, FileText, Save, Loader2, CheckCircle2,
  Upload, GripVertical,
} from 'lucide-react';

export const CandidateProfile: React.FC = () => {
  const { candidateProfile, fetchProfile, updateProfile, profileLoading, error } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    currentLocation: '',
    preferredLocation: '',
    totalExperienceYears: 0,
    currentSalary: 0,
    expectedSalary: 0,
    summary: '',
  });
  const [saved, setSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (candidateProfile) {
      setForm({
        firstName: candidateProfile.firstName || '',
        lastName: candidateProfile.lastName || '',
        headline: candidateProfile.headline || '',
        currentLocation: candidateProfile.currentLocation || '',
        preferredLocation: candidateProfile.preferredLocation || '',
        totalExperienceYears: candidateProfile.totalExperienceYears || 0,
        currentSalary: candidateProfile.currentSalary || 0,
        expectedSalary: candidateProfile.expectedSalary || 0,
        summary: candidateProfile.summary || '',
      });
    }
  }, [candidateProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Completion percentage
  const fields = [form.firstName, form.lastName, form.headline, form.currentLocation, form.summary];
  const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
  const completionPct = Math.round((filled / fields.length) * 100);

  if (profileLoading && !candidateProfile) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your profile updated to improve job matches
          </p>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Profile Completion</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completionPct < 100 ? 'Complete your profile to get noticed by recruiters' : 'Your profile is complete!'}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{completionPct}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Personal */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" name="headline" value={form.headline} onChange={handleChange} placeholder="Senior Frontend Engineer @ Google" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Location
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input id="currentLocation" name="currentLocation" value={form.currentLocation} onChange={handleChange} placeholder="Mumbai, India" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="preferredLocation">Preferred Location</Label>
                <Input id="preferredLocation" name="preferredLocation" value={form.preferredLocation} onChange={handleChange} placeholder="Bangalore, India" />
              </div>
            </div>
          </div>

          {/* Experience & Salary */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Briefcase className="h-5 w-5 text-primary" /> Experience & Compensation
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="totalExperienceYears">Experience (years)</Label>
                <Input id="totalExperienceYears" name="totalExperienceYears" type="number" min={0} value={form.totalExperienceYears} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="currentSalary">Current Salary (₹)</Label>
                <Input id="currentSalary" name="currentSalary" type="number" min={0} value={form.currentSalary} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expectedSalary">Expected Salary (₹)</Label>
                <Input id="expectedSalary" name="expectedSalary" type="number" min={0} value={form.expectedSalary} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" /> Professional Summary
            </h2>
            <div className="mt-4 space-y-1">
              <Textarea
                id="summary"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                rows={5}
                placeholder="Write a compelling summary about yourself, your skills, and career aspirations..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{form.summary.length} / 2000</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving || profileLoading} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated!
              </span>
            )}
          </div>
        </form>

        {/* Right Sidebar: Resume Upload Mock */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Upload className="h-5 w-5 text-primary" /> Resume
            </h2>
            <div
              className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Drag & drop your resume
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC, DOCX up to 5MB
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile views</span>
                <span className="font-semibold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Search appearances</span>
                <span className="font-semibold text-foreground">142</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saved by recruiters</span>
                <span className="font-semibold text-foreground">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
