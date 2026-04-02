import Badge from './Badge'
import {
  getSpecialtyLabel,
  getSpecialtyColor,
  getSessionStatusLabel,
  getSessionStatusColor,
  formatDate,
  formatTime,
  getInitials,
} from '@/lib/utils'
import type { Session } from '@/types'

interface SessionCardProps {
  session: Session & {
    contact?: { name: string }
    therapist?: { name: string }
  }
  onClick?: () => void
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-soft transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-slate-600 text-sm font-bold">
              {session.contact ? getInitials(session.contact.name) : '??'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {session.contact?.name || 'Paciente'}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {session.therapist?.name || 'Terapeuta'}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <Badge
          label={getSessionStatusLabel(session.status)}
          variant={getSessionStatusColor(session.status) as 'default' | 'success' | 'warning' | 'error' | 'info'}
          dot
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecialtyColor(session.specialty)}`}>
          {getSpecialtyLabel(session.specialty)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(session.scheduledAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(session.scheduledAt)} • {session.duration}min</span>
        </div>
      </div>

      {session.notes && (
        <p className="mt-2 text-xs text-slate-400 line-clamp-1 pt-2 border-t border-slate-100">
          {session.notes}
        </p>
      )}
    </div>
  )
}
