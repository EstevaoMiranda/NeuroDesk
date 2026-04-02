import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  change?: number
  color?: 'purple' | 'green' | 'blue' | 'amber' | 'red'
  className?: string
}

const colorClasses = {
  purple: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-600',
    value: 'text-primary-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
}

export default function MetricCard({
  icon,
  title,
  value,
  subtitle,
  change,
  color = 'purple',
  className,
}: MetricCardProps) {
  const colors = colorClasses[color]
  const isPositive = change !== undefined && change >= 0

  return (
    <div className={cn('card', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', colors.icon)}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-lg',
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className={cn('text-3xl font-bold mt-1', colors.value)}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {subtitle && (
          <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
