'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import StatCard from '@/components/dashboard/StatCard'
import FilterSidebar from '@/components/dashboard/FilterSidebar'
import AIStatusPanel from '@/components/dashboard/AIStatusPanel'
import SessionsAndDonut from '@/components/dashboard/SessionsAndDonut'
import MiniStats from '@/components/dashboard/MiniStats'
import {
  statCards,
  aiMetrics,
  aiConversations,
  professionals,
  leadDonut,
  miniStats,
} from '@/lib/mock/dashboardData'

const TABS = ['Geral', 'Atendimentos', 'Leads', 'Financeiro'] as const
type Tab = typeof TABS[number]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Geral')

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Dashboard" />

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#4F5FE0] text-[#4F5FE0]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-5">

        {/* ── 6 Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── 3-column middle section ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_220px] gap-4" style={{ minHeight: 480 }}>

          {/* Filters */}
          <FilterSidebar />

          {/* AI Status Panel */}
          <AIStatusPanel metrics={aiMetrics} conversations={aiConversations} />

          {/* Sessions + Donut */}
          <SessionsAndDonut professionals={professionals} donut={leadDonut} />
        </div>

        {/* ── 9 Mini-stat cards ─────────────────────────────────────────── */}
        <MiniStats stats={miniStats} />
      </div>
    </div>
  )
}
