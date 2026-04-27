import type { Lead, LeadStage } from '@/lib/mock/leadsData'
import LeadCard from './LeadCard'

interface Props {
  id: LeadStage
  label: string
  leads: Lead[]
}

export default function KanbanColumn({ label, leads }: Props) {
  return (
    <div className="bg-gray-100 rounded-xl p-3 flex flex-col min-w-[220px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5">{leads.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[calc(100vh-260px)]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-[11px] text-gray-400">
            Nenhum lead
          </div>
        )}
      </div>
    </div>
  )
}
