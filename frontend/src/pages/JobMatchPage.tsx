import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, Briefcase, CheckCircle2, XCircle, Lightbulb, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Analysis, JobMatch } from '../types'
import ScoreRing from '../components/ui/ScoreRing'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import clsx from 'clsx'

export default function JobMatchPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ job_title: '', job_description: '' })
  const [result, setResult] = useState<JobMatch | null>(null)

  const { data: analysis, isLoading } = useQuery<Analysis>({
    queryKey: ['analysis', id],
    queryFn: () => api.get(`/analysis/${id}`).then((r) => r.data),
  })

  const matchMutation = useMutation({
    mutationFn: () =>
      api.post<JobMatch>('/analysis/job-match', {
        analysis_id: Number(id),
        job_title: form.job_title,
        job_description: form.job_description,
      }),
    onSuccess: (res) => {
      setResult(res.data)
      toast.success('Job match analysis complete!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading…" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link to={`/analysis/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors">
          <ChevronLeft size={15} /> Back to Analysis
        </Link>
        <h1 className="text-2xl font-bold text-white">Job Match Analysis</h1>
        <p className="text-slate-400 mt-1">
          Compare your resume against a specific job posting
          {analysis?.resume && ` · ${analysis.resume.original_filename}`}
        </p>
      </div>

      {/* Form */}
      {!result && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Job Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Job Description *</label>
            <textarea
              className="input min-h-[200px] resize-y"
              placeholder="Paste the full job description here…"
              value={form.job_description}
              onChange={(e) => setForm({ ...form, job_description: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Paste the complete job description for the most accurate match score
            </p>
          </div>
          <button
            onClick={() => matchMutation.mutate()}
            disabled={!form.job_title || !form.job_description || matchMutation.isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {matchMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing match…
              </>
            ) : (
              <>
                <Zap size={16} /> Analyze Job Match
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Match score */}
          <div className="card p-6 flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={result.match_score || 0} label="Match Score" sublabel={result.job_title} size={130} />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-2">{result.job_title}</h2>
              {result.summary && (
                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              )}
            </div>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" /> Matching Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.matching_skills || []).length > 0
                  ? result.matching_skills!.map((s) => (
                      <span key={s} className="badge badge-green">{s}</span>
                    ))
                  : <p className="text-xs text-slate-500">None detected</p>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <XCircle size={15} className="text-red-400" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.missing_skills || []).length > 0
                  ? result.missing_skills!.map((s) => (
                      <span key={s} className="badge badge-red">{s}</span>
                    ))
                  : <p className="text-xs text-slate-500">No critical gaps!</p>}
              </div>
            </div>
          </div>

          {/* Missing keywords */}
          {result.missing_keywords && result.missing_keywords.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((kw) => (
                  <span key={kw} className="badge badge-yellow">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Lightbulb size={15} className="text-blue-400" /> Suggestions to Improve
              </h3>
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-blue-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rerun */}
          <button
            onClick={() => setResult(null)}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            <Briefcase size={15} /> Analyze Another Job
          </button>
        </div>
      )}
    </div>
  )
}
