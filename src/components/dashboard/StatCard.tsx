interface StatCardProps {
  value: string | number
  label: string
  color?: string
  badge?: string
  badgeVariant?: 'red' | 'amber'
}

export default function StatCard({ value, label, color = '#4F5FE0', badge, badgeVariant }: StatCardProps) {
  const badgeColors = {
    red:   'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-1 hover:shadow-soft transition-shadow">
      <span
        className="text-3xl font-bold leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      {badge && (
        <span className={`mt-1 self-start text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeVariant ? badgeColors[badgeVariant] : 'bg-slate-100 text-slate-600'}`}>
          {badge}
        </span>
      )}
    </div>
  )
}
