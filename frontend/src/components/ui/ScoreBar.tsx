import clsx from 'clsx'

interface ScoreBarProps {
  label: string
  score: number
  icon?: React.ReactNode
}

function getColor(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getTextColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

export default function ScoreBar({ label, score, icon }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className={clsx('text-sm font-semibold tabular-nums', getTextColor(score))}>
          {Math.round(score)}
        </span>
      </div>
      <div className="h-2 bg-white/6 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-1000 ease-out',
            getColor(score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
