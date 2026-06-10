import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Trash2, ChevronRight, Clock, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Analysis } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { format } from 'date-fns'
import clsx from 'clsx'

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/15'
  if (score >= 60) return 'text-amber-400 bg-amber-500/15'
  return 'text-red-400 bg-red-500/15'
}

export default function HistoryPage() {
  const qc = useQueryClient()

  const { data: analyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: () => api.get('/analysis/history?limit=50').then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/analysis/${id}`),
    onSuccess: () => {
      toast.success('Analysis deleted')
      qc.invalidateQueries({ queryKey: ['analyses'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading history…" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis History</h1>
          <p className="text-slate-400 mt-1">
            {analyses?.length ?? 0} resume {analyses?.length === 1 ? 'analysis' : 'analyses'}
          </p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <Upload size={15} /> New Analysis
        </Link>
      </div>

      {!analyses?.length ? (
        <EmptyState
          icon={Clock}
          title="No history yet"
          description="Your resume analyses will appear here after you upload and analyze a resume."
          action={{ label: 'Upload Resume', to: '/upload' }}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-white/6">
            {analyses.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/4 transition-colors group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-brand-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {a.resume?.original_filename || 'Resume'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(a.created_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>

                {/* Scores */}
                <div className="hidden sm:flex items-center gap-4">
                  {[
                    { label: 'ATS', score: a.ats_score },
                    { label: 'Keywords', score: a.keyword_score },
                    { label: 'Overall', score: a.overall_score },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <div className={clsx(
                        'text-sm font-semibold tabular-nums px-2.5 py-0.5 rounded-lg',
                        scoreColor(score || 0)
                      )}>
                        {Math.round(score || 0)}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); deleteMutation.mutate(a.id) }}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link
                    to={`/analysis/${a.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
