import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUsersThunk, updateUserStatusThunk, type UserAdminData } from '../../features/admin/adminSlice';
import {
  Search,
  UserCheck,
  UserX,
  Lock,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsersThunk());
  }, [dispatch]);

  const handleStatusChange = async (userId: string, newStatus: UserAdminData['status']) => {
    setUpdatingId(userId);
    try {
      await dispatch(updateUserStatusThunk({ id: userId, status: newStatus })).unwrap();
    } catch (err) {
      console.error('Failed to update user status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchUsersThunk());
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = user.phone ? user.phone.includes(searchQuery) : false;
      const matchesSearch = emailMatch || phoneMatch;

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const statusBadges: Record<UserAdminData['status'], { color: string; label: string }> = {
    active: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Active' },
    pending: { color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Pending' },
    suspended: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Suspended' },
    locked: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Locked' },
  };

  const roleLabels: Record<UserAdminData['role'], string> = {
    candidate: 'Candidate',
    recruiter: 'Recruiter',
    company_admin: 'Company Admin',
    admin: 'System Admin',
  };

  const formatRegistered = (value: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      verified: users.filter((u) => u.emailVerified).length,
      candidates: users.filter((u) => u.role === 'candidate').length,
      recruiters: users.filter((u) => u.role === 'recruiter' || u.role === 'company_admin').length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View profiles, control verification state, and activate or suspend accounts.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2 border-border/80 hover:bg-muted/80 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Accounts
          </Button>
        </div>
      </div>

      {/* Quick guide */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total accounts</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Email verified</p>
          <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Candidates</p>
          <p className="text-2xl font-bold text-foreground">{stats.candidates}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Recruiters</p>
          <p className="text-2xl font-bold text-foreground">{stats.recruiters}</p>
        </div>
      </div>

      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">How to read this table:</strong> Email is the login ID.{' '}
        <strong>Verification</strong> = email confirmed at signup (auto-verified for now).{' '}
        <strong>Status</strong> = you control access — use actions to Activate, Suspend, or Lock.{' '}
        Phone shows only if the user added it in their profile.
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="candidate">Candidates</SelectItem>
                <SelectItem value="recruiter">Recruiters</SelectItem>
                <SelectItem value="company_admin">Company Admins</SelectItem>
                <SelectItem value="admin">System Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>Error loading accounts list: {error}</span>
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="mt-4 text-sm text-muted-foreground">Fetching system accounts list...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Mail className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium text-foreground">No accounts found</p>
          <p className="mt-1 text-sm text-muted-foreground">Adjust your filters or try a different keyword.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                  {/* User Profile */}
                  <TableCell className="font-medium">
                    <span className="font-semibold text-foreground">{user.email}</span>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs font-medium">
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>

                  {/* Verification */}
                  <TableCell>
                    <Badge
                      variant={user.emailVerified ? 'default' : 'outline'}
                      className={`text-[10px] ${
                        user.emailVerified
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                          : 'text-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}
                    >
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>

                  {/* Registered */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatRegistered(user.createdAt)}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs font-semibold px-2 py-0.5 ${statusBadges[user.status].color}`}
                    >
                      {statusBadges[user.status].label}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {updatingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-3" />
                      ) : (
                        <>
                          {/* Active Button */}
                          {user.status !== 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500"
                              title="Activate Account"
                              onClick={() => handleStatusChange(user.id, 'active')}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Suspend Button */}
                          {user.status !== 'suspended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500"
                              title="Suspend Account"
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Lock Button */}
                          {user.status !== 'locked' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-500"
                              title="Lock Account"
                              onClick={() => handleStatusChange(user.id, 'locked')}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
