'use client'

import Link from 'next/link'
import type { AIMetric, AIConversation, AIConvVariant } from '@/lib/mock/dashboardData'

interface Props {
  metrics: AIMetric[]
  conversations: AIConversation[]
}

const variantStyles: Record<AIConvVariant, {
  card: string
  icon: React.ReactNode
  btn: string
}> = {
  alert: {
    card: 'bg-[#FEECEC] border border-[#F7C1C1]',
    icon: (
      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    btn: 'bg-[#FEECEC] text-[#791F1F] hover:bg-red-100 border border-[#F7C1C1]',
  },
  waiting: {
    card: 'bg-[#FAEEDA] border border-[#FAC775]',
    icon: (
      <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    btn: 'bg-[#FAEEDA] text-[#633806] hover:bg-amber-100 border border-[#FAC775]',
  },
  managing: {
    card: 'bg-[#F0F4FF] border border-[#C5CBEF]',
    icon: (
      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    btn: 'bg-[#EEF0FC] text-[#3C3489] hover:bg-indigo-100 border border-[#C5CBEF]',
  },
}

export default function AIStatusPanel({ metrics, conversations }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Agente IA — status em tempo real
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Online
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-2.5 text-center"
            style={{ background: `${m.color}12` }}
          >
            <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Conversations list */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
        {conversations.map((conv) => {
          const styles = variantStyles[conv.variant]
          return (
            <div key={conv.id} className={`rounded-xl p-3 ${styles.card}`}>
              <div className="flex items-start gap-2 mb-2">
                {styles.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 truncate">{conv.contactName}</span>
                    <span className="text-[10px] text-slate-500 bg-white/60 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {conv.context}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">{conv.statusText}</p>
                </div>
              </div>
              <Link
                href={conv.actionHref}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${styles.btn}`}
              >
                {conv.actionLabel}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
