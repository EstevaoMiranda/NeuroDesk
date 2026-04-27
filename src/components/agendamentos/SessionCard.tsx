import type { AgendaSession } from '@/lib/mock/sessionsData'
import { sessionStyles } from '@/lib/mock/sessionsData'

export default function SessionCard({ session }: { session: AgendaSession }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`rounded px-1.5 py-1 text-[9px] leading-tight ${sessionStyles[session.status]}`}>
        <p className="font-semibold truncate">{session.patientName}</p>
        <p className="opacity-70 truncate">{session.professionalInitials} · {session.specialty}</p>
      </div>
      {session.atPending && (
        <div className="bg-gray-100 border-l-2 border-gray-400 rounded px-1.5 py-1 text-[9px] text-gray-500">
          AT — aguarda decisão
        </div>
      )}
    </div>
  )
}
