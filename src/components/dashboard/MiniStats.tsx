import type { MiniStat } from '@/lib/mock/dashboardData'

const badgeColors = {
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
}

export default function MiniStats({ stats }: { stats: MiniStat[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1"
        >
          <span className="text-2xl font-bold text-slate-800">{s.value}</span>
          <span className="text-[10px] text-slate-500 leading-tight">{s.label}</span>
          {s.badge && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              s.badgeVariant ? badgeColors[s.badgeVariant] : 'bg-slate-100 text-slate-600'
            }`}>
              {s.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
