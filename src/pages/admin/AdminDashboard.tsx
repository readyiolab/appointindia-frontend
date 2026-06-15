import React, { useState, useEffect } from 'react';
import {
  Users,
  Database,
  Cpu,
  Activity,
  Server,
  Shield,
  TrendingUp,
  Clock,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

export const AdminDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(58);
  const [dbStatus, setDbStatus] = useState<'healthy' | 'slow' | 'down'>('healthy');

  // Simulate metrics updating
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(15, Math.min(95, prev + delta));
      });
      setMemoryUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(45, Math.min(85, prev + delta));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Randomize slightly
      setDbStatus(Math.random() > 0.85 ? 'slow' : 'healthy');
    }, 1000);
  };

  // Mock dashboard stats
  const stats = [
    {
      title: 'Total Active Users',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      bg: 'from-indigo-500/10 to-indigo-600/5',
      glow: 'shadow-indigo-500/10',
    },
    {
      title: 'API Server Response',
      value: '124 ms',
      change: '-18%',
      trend: 'up', // lower is better
      icon: <Activity className="h-5 w-5 text-emerald-500" />,
      bg: 'from-emerald-500/10 to-emerald-600/5',
      glow: 'shadow-emerald-500/10',
    },
    {
      title: 'Database Transactions',
      value: '48.2k',
      change: '+8.3k today',
      trend: 'up',
      icon: <Database className="h-5 w-5 text-amber-500" />,
      bg: 'from-amber-500/10 to-amber-600/5',
      glow: 'shadow-amber-500/10',
    },
    {
      title: 'System Security Health',
      value: '100%',
      change: 'Fully Guarded',
      trend: 'neutral',
      icon: <Shield className="h-5 w-5 text-pink-500" />,
      bg: 'from-pink-500/10 to-pink-600/5',
      glow: 'shadow-pink-500/10',
    },
  ];

  // Mock server logs
  const logs = [
    { time: '11:38:12', service: 'auth-service', type: 'info', message: 'Token refresh initiated for user: candidate@appointindia.com' },
    { time: '11:37:45', service: 'gateway', type: 'info', message: 'GET /api/v1/jobs/search - 200 OK (22ms)' },
    { time: '11:35:21', service: 'db-pool', type: 'info', message: 'Database connection pool usage: 12 active, 8 idle' },
    { time: '11:32:04', service: 'recruiter-service', type: 'info', message: 'New job listing created: "Principal Frontend Architect" (UUID: 7a8d8e)' },
    { time: '11:29:50', service: 'auth-service', type: 'warning', message: 'Failed login attempt from IP 192.168.1.104 for: admin@admin.com' },
    { time: '11:24:18', service: 'jobs-service', type: 'info', message: 'Expired job archive cron job completed - 3 rows updated' },
    { time: '11:15:02', service: 'gateway', type: 'info', message: 'PATCH /api/v1/applications/4a3b-28de/status - 200 OK (45ms)' },
  ];

  // User breakdown count
  const rolesBreakdown = [
    { role: 'Candidate', count: 948, percentage: 74, color: 'bg-indigo-500' },
    { role: 'Recruiter', count: 212, percentage: 16, color: 'bg-amber-500' },
    { role: 'Company Admin', count: 104, percentage: 8, color: 'bg-pink-500' },
    { role: 'System Admin', count: 20, percentage: 2, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor real-time system performance, system health, and user metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-2 border-border/80 hover:bg-muted/80 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${stat.bg} p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5`}
          >
            {/* Ambient Background Glow on Hover */}
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-current opacity-0 blur-2xl group-hover:opacity-10 transition-opacity duration-300 text-foreground`} />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className="rounded-lg p-2 bg-background/50 backdrop-blur-md border border-border/30">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span
                className={`text-xs font-semibold ${
                  stat.trend === 'up'
                    ? 'text-emerald-500'
                    : stat.trend === 'down'
                    ? 'text-amber-500'
                    : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Performance & Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core System Performance */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Cpu className="h-4 w-4 text-indigo-500" />
                Performance Metrics
              </h3>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-mono">
                Real-Time
              </Badge>
            </div>

            <div className="mt-6 space-y-6">
              {/* CPU */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">CPU Core Load</span>
                  <span className={`font-mono font-bold ${cpuUsage > 80 ? 'text-rose-500' : cpuUsage > 60 ? 'text-amber-500' : 'text-foreground'}`}>
                    {cpuUsage}%
                  </span>
                </div>
                <Progress value={cpuUsage} className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600" />
              </div>

              {/* Memory */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Node.js Heap Memory</span>
                  <span className="font-mono font-bold text-foreground">{memoryUsage}%</span>
                </div>
                <Progress value={memoryUsage} className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600" />
              </div>

              {/* Hard Drive Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">App Storage Volume</span>
                  <span className="font-mono font-bold text-foreground">32.8 GB / 120 GB (27%)</span>
                </div>
                <Progress value={27} className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600" />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" />
              NVMe Primary SSD
            </span>
            <span>Uptime: 14d 8h 22m</span>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Users className="h-4 w-4 text-emerald-500" />
                User Base Distribution
              </h3>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-mono">
                Ratios
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              {rolesBreakdown.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{item.role}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {item.count} <span className="text-muted-foreground/60">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              184 signups this week
            </span>
            <span className="underline hover:text-foreground cursor-pointer">Manage users</span>
          </div>
        </div>

        {/* Backend Services Health */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Server className="h-4 w-4 text-amber-500" />
                Service Health
              </h3>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-mono">
                Status
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              {/* API Server */}
              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">API Gateway</p>
                    <p className="text-[10px] text-muted-foreground">Express v4.19.2</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-medium text-emerald-500">Online</span>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">PostgreSQL DB</p>
                    <p className="text-[10px] text-muted-foreground">v16.2 on AWS RDS</p>
                  </div>
                </div>
                {dbStatus === 'healthy' ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-500">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-amber-500">Degraded</span>
                  </div>
                )}
              </div>

              {/* Cache Layer */}
              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Redis Cache</p>
                    <p className="text-[10px] text-muted-foreground">Memory store cluster</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[11px] font-medium text-emerald-500">98% hit rate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-right">
            <span className="text-[11px] text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between bg-muted/50 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-foreground">Live Application Logs</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-mono">Listening on port 3000</span>
          </div>
        </div>
        <div className="p-4 bg-zinc-950 font-mono text-xs leading-relaxed text-zinc-300 overflow-x-auto max-h-[300px] divide-y divide-zinc-900/50">
          {logs.map((log, idx) => (
            <div key={idx} className="py-2 flex items-start gap-3">
              <span className="text-zinc-500 select-none shrink-0">[{log.time}]</span>
              <span
                className={`font-semibold shrink-0 uppercase text-[10px] px-1 rounded ${
                  log.type === 'error'
                    ? 'bg-rose-500/10 text-rose-400'
                    : log.type === 'warning'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}
              >
                {log.service}
              </span>
              <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'warning' ? 'text-amber-300' : 'text-zinc-300'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
