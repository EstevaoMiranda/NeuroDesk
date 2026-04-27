import type { Professional } from '@/lib/mock/dashboardData'

interface DonutSegment { value: number; color: string; label: string }

function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = 36
  const circumference = 2 * Math.PI * radius

  let accumulated = 0
  const arcs = segments.map((seg) => {
    const length = (seg.value / total) * circumference
    const offset = accumulated
    accumulated += length
    return { ...seg, length, offset }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={50} cy={50} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={18} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={50} cy={50} r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={18}
          strokeDasharray={`${arc.length} ${circumference - arc.length}`}
          strokeDashoffset={-arc.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  )
}

interface Props {
  professionals: Professional[]
  donut: { labels: string[]; data: number[]; colors: string[] }
}

export default function SessionsAndDonut({ professionals, donut }: Props) {
  const donutSegments: DonutSegment[] = donut.labels.map((label, i) => ({
    label,
    value: donut.data[i],
    color: donut.colors[i],
  }))
  const total = donut.data.reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full">
      {/* Professionals list */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sessões por profissional</h3>
        {professionals.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: p.color }}
            >
              {p.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                <span className="text-xs font-bold text-slate-900 flex-shrink-0 ml-1">{p.sessions}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${p.pct}%`, background: p.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Donut */}
      <div className="border-t border-slate-100 p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Funil de leads</h3>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <DonutChart segments={donutSegments} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700">{total}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            {donutSegments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-[11px] text-slate-600">{seg.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-800">
                  {Math.round((seg.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
