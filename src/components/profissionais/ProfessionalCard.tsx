import type { Professional } from '@/lib/mock/professionalsData'
import { SPECIALTY_STYLES, SPECIALTY_LABELS } from '@/lib/mock/professionalsData'

export default function ProfessionalCard({ prof }: { prof: Professional }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          style={{ background: prof.avatarColor }}
        >
          {prof.initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{prof.name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${prof.isActive ? 'bg-green-500' : 'bg-red-400'}`}
            />
            {prof.role}
          </p>
        </div>
      </div>

      {/* Specialty badges */}
      <div className="flex gap-1 flex-wrap mb-3">
        {prof.specialties.map((s) => (
          <span key={s} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${SPECIALTY_STYLES[s]}`}>
            {SPECIALTY_LABELS[s]}
          </span>
        ))}
        {prof.isAT && (
          <span className="bg-[#FAEEDA] text-[#633806] text-[9px] font-medium px-1.5 py-0.5 rounded">
            AT
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-800">{prof.sessionsCount}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Sessões</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{prof.patientsCount}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Pacientes</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {prof.isAT ? prof.hourlyRate : prof.confirmationRate}
          </p>
          <p className="text-[9px] text-gray-400 mt-0.5">
            {prof.isAT ? 'Custo/h' : 'Confirm.'}
          </p>
        </div>
      </div>
    </div>
  )
}
