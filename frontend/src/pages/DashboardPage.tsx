import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Upload, TrendingUp, FileText, Target, ArrowRight, ChevronRight, Plus } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import type { Analysis } from '../types'
import ScoreRing from '../components/ui/ScoreRing'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { format } from 'date-fns'
import clsx from 'clsx'

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: analyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: () => api.get('/analysis/history?limit=10').then((r) => r.data),
  })

  const latest = analyses?.[0]

  const radarData = latest
    ? [
        { subject: 'ATS', score: latest.ats_score || 0 },
        { subject: 'Keywords', score: latest.keyword_score || 0 },
        { subject: 'Readability', score: latest.readability_score || 0 },
        { subject: 'Formatting', score: latest.formatting_score || 0 },
        { subject: 'Overall', score: latest.overall_score || 0 },
      ]
    : []

  const barData = analyses
    ?.slice()
    .reverse()
    .map((a) => ({
      name: format(new Date(a.created_at), 'MMM d'),
      score: Math.round(a.ats_score || 0),
    })) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading dashboard…" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            {analyses?.length
              ? `You have ${analyses.length} resume ${analyses.length === 1 ? 'analysis' : 'analyses'}`
              : 'Upload your first resume to get started'}
          </p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Analysis
        </Link>
      </div>

      {!analyses?.length ? (
        <EmptyState
          icon={Upload}
          title="No analyses yet"
          description="Upload your resume and get an instant AI-powered ATS score with detailed recommendations."
          action={{ label: 'Upload Resume', to: '/upload' }}
        />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'ATS Score',
                value: latest?.ats_score ? `${Math.round(latest.ats_score)}` : '—',
                sub: 'Latest analysis',
                icon: Target,
                color: latest?.ats_score ? scoreColor(latest.ats_score) : 'text-slate-400',
              },
              {
                label: 'Keyword Match',
                value: latest?.keyword_score ? `${Math.round(latest.keyword_score)}` : '—',
                sub: 'Keywords found',
                icon: TrendingUp,
                color: latest?.keyword_score ? scoreColor(latest.keyword_score) : 'text-slate-400',
              },
              {
                label: 'Skills Found',
                value: latest?.skills?.length ?? '—',
                sub: 'Detected skills',
                icon: FileText,
                color: 'text-blue-400',
              },
              {
                label: 'Analyses',
                value: analyses.length,
                sub: 'Total runs',
                icon: Upload,
                color: 'text-purple-400',
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="card p-5 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-slate-400">{label}</p>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon size={15} className={color} />
                  </div>
                </div>
                <p className={clsx('text-3xl font-bold tabular-nums', color)}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-200 mb-4">Score Breakdown</h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Radar
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No data</div>
              )}
            </div>

            {/* Bar chart */}
            <div className="card p-6">
              <h3 className="text-base font-semibold text-slate-200 mb-4">ATS Score Trend</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={24}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
                      cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                    />
                    <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">Not enough data</div>
              )}
            </div>
          </div>

          {/* Latest analysis */}
          {latest && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-200">Latest Analysis</h3>
                <Link
                  to={`/analysis/${latest.id}`}
                  className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View full report <ChevronRight size={14} />
                </Link>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Score rings */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <ScoreRing score={latest.ats_score || 0} label="ATS Score" size={100} />
                  <ScoreRing score={latest.keyword_score || 0} label="Keywords" size={100} />
                  <ScoreRing score={latest.readability_score || 0} label="Readability" size={100} />
                  <ScoreRing score={latest.formatting_score || 0} label="Formatting" size={100} />
                </div>

                {/* Recommendations preview */}
                {latest.recommendations && latest.recommendations.length > 0 && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-3">Top Recommendations</p>
                    <div className="space-y-2">
                      {latest.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                            {i + 1}
                          </span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent history table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="text-base font-semibold text-slate-200">Recent Analyses</h3>
              <Link to="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-white/6">
              {analyses.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  to={`/analysis/${a.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {a.resume?.original_filename || 'Resume'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(a.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('text-sm font-semibold tabular-nums', scoreColor(a.ats_score || 0))}>
                      {Math.round(a.ats_score || 0)}
                    </span>
                    <ChevronRight size={14} className="text-slate-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
