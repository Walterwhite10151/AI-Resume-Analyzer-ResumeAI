import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Resume, Analysis } from '../types'
import clsx from 'clsx'

const TIPS = [
  'Use standard fonts like Arial, Calibri, or Times New Roman',
  'Avoid tables, graphics, and text boxes that confuse ATS',
  'Include relevant keywords from job descriptions',
  'Use standard section headings: Experience, Education, Skills',
  'Save as PDF for best compatibility',
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setError('')
    if (rejected.length > 0) {
      setError('Only PDF and DOCX files are allowed (max 10MB)')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    setError('')

    try {
      // Step 1: Upload
      setStep('uploading')
      setProgress(20)
      const formData = new FormData()
      formData.append('file', file)
      const { data: resume } = await api.post<Resume>('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round(((e.loaded || 0) / (e.total || 1)) * 40)
          setProgress(20 + pct)
        },
      })

      // Step 2: Analyze
      setStep('analyzing')
      setProgress(65)
      const { data: analysis } = await api.post<Analysis>(`/analysis/analyze/${resume.id}`)
      setProgress(100)
      setStep('done')

      toast.success('Analysis complete!')
      setTimeout(() => navigate(`/analysis/${analysis.id}`), 600)
    } catch (err: any) {
      setStep('idle')
      setProgress(0)
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(msg)
      toast.error(msg)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError('')
  }

  const isProcessing = step === 'uploading' || step === 'analyzing'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
        <p className="text-slate-400 mt-1">Upload your PDF or DOCX resume for AI-powered ATS analysis</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-brand-500 bg-brand-500/8'
            : file
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-white/15 hover:border-brand-500/50 hover:bg-brand-500/4',
          isProcessing && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <FileText size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={clsx(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
              isDragActive ? 'bg-brand-500/20' : 'bg-white/6'
            )}>
              <Upload size={28} className={isDragActive ? 'text-brand-400' : 'text-slate-500'} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or <span className="text-brand-400">click to browse</span> — PDF or DOCX, max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {step === 'uploading' ? 'Uploading resume…' : 'Running AI analysis…'}
            </span>
            <span className="text-brand-400 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {step === 'analyzing' ? 'Claude is analyzing your resume against ATS criteria…' : 'Processing file…'}
          </p>
        </div>
      )}

      {/* Actions */}
      {!isProcessing && (
        <div className="flex gap-3">
          {file && (
            <button onClick={removeFile} className="btn-secondary flex items-center gap-2 text-sm">
              <X size={15} /> Remove
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!file || isProcessing}
            className="btn-primary flex items-center gap-2 text-sm flex-1 justify-center py-3"
          >
            <Zap size={16} />
            Analyze Resume with AI
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          ATS Tips for Best Results
        </h3>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500/60 flex-shrink-0 mt-2" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
