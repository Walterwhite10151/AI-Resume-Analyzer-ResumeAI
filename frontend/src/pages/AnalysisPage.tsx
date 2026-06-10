import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Briefcase, Trash2, RefreshCw,
  CheckCircle2, AlertTriangle, Lightbulb, Tag, Key,
  GraduationCap, Award, Code2, User2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Analysis } from '../types'
import ScoreRing from '../components/ui/ScoreRing'
import ScoreBar from '../components/ui/ScoreBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import clsx from 'clsx'

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']

export default function AnalysisPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: analysis, isLoading } = useQuery<Analysis>({
    queryKey: ['analysis', id],
    queryFn: () => api.get(`/analysis/${id}`).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/analysis/${id}`),
    onSuccess: () => {
      toast.success('Analysis deleted')
      qc.invalidateQueries({ queryKey: ['analyses'] })
      navigate('/history')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading analysis…" />
      </div>
    )
  }

  if (!analysis) return null

  const keywordPieData = [
    { name: 'Technical', value: Math.round((analysis.keyword_density?.technical || 0.3) * 100) },
    { name: 'Soft Skills', value: Math.round((analysis.keyword_density?.soft_skills || 0.2) * 100) },
    { name: 'Action Verbs', value: Math.round((analysis.keyword_density?.action_verbs || 0.15) * 100) },
    { name: 'Other', value: Math.max(5, 100 - Math.round(((analysis.keyword_density?.technical || 0.3) + (analysis.keyword_density?.soft_skills || 0.2) + (analysis.keyword_density?.action_verbs || 0.15)) * 100)) },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-3 transition-colors">
            <ChevronLeft size={15} /> Back to History
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {analysis.resume?.original_filename || 'Resume Analysis'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyzed {format(new Date(analysis.created_at), 'PPP')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/job-match/${analysis.id}`}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Briefcase size={15} /> Job Match
          </Link>
          <button
            onClick={() => deleteMutation.mutate()}
            className="btn-danger flex items-center gap-2 text-sm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="card p-5 border-l-2 border-brand-500">
          <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* Score rings */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-200 mb-6">Score Overview</h2>
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          <ScoreRing score={analysis.ats_score || 0} label="ATS Score" sublabel="Applicant Tracking" size={110} />
          <ScoreRing score={analysis.keyword_score || 0} label="Keywords" sublabel="Keyword Match" size={110} />
          <ScoreRing score={analysis.readability_score || 0} label="Readability" sublabel="Clarity & Flow" size={110} />
          <ScoreRing score={analysis.formatting_score || 0} label="Formatting" sublabel="Structure" size={110} />
          <ScoreRing score={analysis.overall_score || 0} label="Overall" sublabel="Combined Score" size={110} />
        </div>
      </div>

      {/* Score bars + Keyword pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Detailed Scores</h2>
          <ScoreBar label="ATS Compatibility" score={analysis.ats_score || 0} />
          <ScoreBar label="Keyword Density" score={analysis.keyword_score || 0} />
          <ScoreBar label="Readability" score={analysis.readability_score || 0} />
          <ScoreBar label="Formatting" score={analysis.formatting_score || 0} />
          <ScoreBar label="Overall Quality" score={analysis.overall_score || 0} />
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Keyword Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={keywordPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {keywordPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 13 }}
                formatter={(v: any) => [`${v}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {keywordPieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths / Weaknesses / Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeedbackCard
          title="Strengths"
          icon={<CheckCircle2 size={15} className="text-emerald-400" />}
          items={analysis.strengths || []}
          itemColor="text-emerald-300"
          dotColor="bg-emerald-500"
        />
        <FeedbackCard
          title="Weaknesses"
          icon={<AlertTriangle size={15} className="text-amber-400" />}
          items={analysis.weaknesses || []}
          itemColor="text-amber-300"
          dotColor="bg-amber-500"
        />
        <FeedbackCard
          title="Recommendations"
          icon={<Lightbulb size={15} className="text-blue-400" />}
          items={analysis.recommendations || []}
          itemColor="text-blue-300"
          dotColor="bg-blue-500"
        />
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeywordSection
          title="Found Keywords"
          icon={<Tag size={15} className="text-emerald-400" />}
          keywords={analysis.existing_keywords || []}
          badgeClass="badge-green"
          empty="No keywords detected"
        />
        <KeywordSection
          title="Missing Keywords"
          icon={<Key size={15} className="text-red-400" />}
          keywords={analysis.missing_keywords || []}
          badgeClass="badge-red"
          empty="No missing keywords detected"
        />
      </div>

      {/* Skills */}
      {analysis.skills && analysis.skills.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Code2 size={16} className="text-brand-400" /> Detected Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill) => (
              <span key={skill} className="badge badge-purple">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {analysis.experience && analysis.experience.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-brand-400" /> Work Experience
          </h2>
          <div className="space-y-4">
            {analysis.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-brand-500/30 pl-4">
                <p className="font-medium text-slate-200">{exp.title}</p>
                <p className="text-sm text-slate-400">{exp.company} · {exp.duration}</p>
                {exp.description && <p className="text-sm text-slate-500 mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {analysis.education && analysis.education.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <GraduationCap size={16} className="text-brand-400" /> Education
          </h2>
          <div className="space-y-3">
            {analysis.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap size={14} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                  <p className="text-xs text-slate-400">{edu.institution}{edu.year ? ` · ${edu.year}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Match CTA */}
      <div className="card p-6 bg-gradient-to-r from-brand-900/40 to-purple-900/40 border-brand-500/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white">Check Job Match</h3>
            <p className="text-sm text-slate-400 mt-1">
              See how your resume matches against a specific job description
            </p>
          </div>
          <Link
            to={`/job-match/${analysis.id}`}
            className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
          >
            <Briefcase size={15} /> Analyze Match
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeedbackCard({ title, icon, items, itemColor, dotColor }: {
  title: string
  icon: React.ReactNode
  items: string[]
  itemColor: string
  dotColor: string
}) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5', dotColor)} />
            <span className={itemColor}>{item}</span>
          </div>
        )) : (
          <p className="text-xs text-slate-500">None detected</p>
        )}
      </div>
    </div>
  )
}

function KeywordSection({ title, icon, keywords, badgeClass, empty }: {
  title: string
  icon: React.ReactNode
  keywords: string[]
  badgeClass: string
  empty: string
}) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        {icon} {title}
        <span className="ml-auto text-xs text-slate-500">{keywords.length} items</span>
      </h3>
      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {keywords.map((kw) => (
            <span key={kw} className={clsx('badge', badgeClass)}>{kw}</span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">{empty}</p>
      )}
    </div>
  )
}
