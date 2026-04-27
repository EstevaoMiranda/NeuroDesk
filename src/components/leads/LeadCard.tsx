import type { Lead } from '@/lib/mock/leadsData'
import { DIAGNOSIS_STYLES, DIAGNOSIS_LABELS } from '@/lib/mock/leadsData'

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div
      className={`bg-white rounded-xl p-3 text-sm shadow-sm ${
        lead.hasAlert ? 'border border-amber-400' : 'border border-gray-200'
      }`}
    >
      {/* Name + badges row */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="font-medium text-gray-800 text-xs leading-tight">{lead.familyName}</p>
        <div className="flex gap-1 flex-shrink-0">
          {lead.hasAlert && (
            <span className="bg-[#FEECEC] text-[#A32D2D] text-[9px] font-medium px-1.5 py-0.5 rounded">
              Seguir up
            </span>
          )}
          {lead.isConverted && (
            <span className="bg-[#EAF3DE] text-[#27500A] text-[9px] font-medium px-1.5 py-0.5 rounded">
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* Interest */}
      <p className="text-[11px] text-gray-500 mb-2 leading-snug">{lead.interest}</p>

      {/* Visit date */}
      {lead.visitDate && (
        <p className="text-[11px] text-[#4F5FE0] font-medium mb-2">📅 {lead.visitDate}</p>
      )}

      {/* Footer: diagnosis + time */}
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${DIAGNOSIS_STYLES[lead.diagnosis]}`}>
          {DIAGNOSIS_LABELS[lead.diagnosis]}
        </span>
        <span className="text-[10px] text-gray-400">{lead.createdAt}</span>
      </div>
    </div>
  )
}
