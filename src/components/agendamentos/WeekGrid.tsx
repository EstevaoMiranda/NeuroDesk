import type { AgendaSession } from '@/lib/mock/sessionsData'
import { TIME_SLOTS, DAYS } from '@/lib/mock/sessionsData'
import SessionCard from './SessionCard'

export default function WeekGrid({ sessions }: { sessions: AgendaSession[] }) {
  function getCell(dayIndex: number, timeSlot: string): AgendaSession[] {
    return sessions.filter((s) => s.dayIndex === dayIndex && s.timeSlot === timeSlot)
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day headers */}
        <div className="grid grid-cols-[50px_repeat(5,1fr)] border-b border-gray-200">
          <div className="border-r border-gray-200 p-2" />
          {DAYS.map((day, i) => (
            <div key={i} className="border-r border-gray-200 p-2 text-center last:border-r-0">
              <p className="text-[10px] text-gray-400 uppercase">{day.label}</p>
              <div className="flex justify-center mt-0.5">
                <span
                  className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    day.isToday ? 'bg-[#4F5FE0] text-white' : 'text-gray-700'
                  }`}
                >
                  {day.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Time rows */}
        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="grid grid-cols-[50px_repeat(5,1fr)]">
            {/* Hour column */}
            <div className="border-r border-b border-gray-200 min-h-[52px] p-2 text-[10px] text-gray-400 flex items-start">
              {slot}
            </div>
            {/* Day cells */}
            {DAYS.map((_, dayIdx) => {
              const cellSessions = getCell(dayIdx, slot)
              return (
                <div
                  key={dayIdx}
                  className="border-r border-b border-gray-200 min-h-[52px] p-1 last:border-r-0"
                >
                  {cellSessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
