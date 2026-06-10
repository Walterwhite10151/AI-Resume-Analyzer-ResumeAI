import clsx from 'clsx'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'text-emerald-400' }
  if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'text-amber-400' }
  return { stroke: '#ef4444', text: 'text-red-400', bg: 'text-red-400' }
}

function getScoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Needs Work'
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference
  const colors = getScoreColor(score)

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            className="score-ring transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.stroke}60)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx('text-2xl font-bold leading-none', colors.text)}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">/ 100</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
          <p className={clsx('text-xs font-medium mt-1', colors.text)}>
            {getScoreLabel(score)}
          </p>
        </div>
      )}
    </div>
  )
}
