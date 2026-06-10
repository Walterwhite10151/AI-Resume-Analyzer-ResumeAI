import { useQuery } from '@tanstack/react-query'
import {
  Users, FileText, BarChart3, TrendingUp,
  Activity, Shield,
} from 'lucide-react'
import api from '../services/api'
import type { AdminStats } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import clsx from 'clsx'

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading admin stats…" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">System overview and statistics</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15' },
          { label: 'Total Resumes', value: stats.total_resumes, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/15' },
          { label: 'Total Analyses', value: stats.total_analyses, icon: BarChart3, color: 'text-brand-400', bg: 'bg-brand-500/15' },
          { label: 'Avg ATS Score', value: `${stats.avg_ats_score}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className={clsx('text-3xl font-bold tabular-nums', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily analyses */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-brand-400" /> Analyses Per Day
          </h3>
          {stats.analyses_per_day.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.analyses_per_day}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Popular skills */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Top Skills</h3>
          {stats.popular_skills.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.popular_skills.slice(0, 8)} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="skill" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 13 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent analyses table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-base font-semibold text-slate-200">Recent Analyses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                {['ID', 'User', 'File', 'ATS Score', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recent_analyses.map((a) => (
                <tr key={a.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-slate-500 font-mono">#{a.id}</td>
                  <td className="px-5 py-3 text-slate-200">{a.user_name}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{a.filename}</td>
                  <td className="px-5 py-3">
                    <span className={clsx('font-semibold tabular-nums', scoreColor(a.ats_score))}>
                      {Math.round(a.ats_score)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {a.created_at ? format(new Date(a.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              ))}
              {stats.recent_analyses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No analyses yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
