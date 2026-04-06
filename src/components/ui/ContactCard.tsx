'use client'

import Badge from './Badge'
import {
  getInitials,
  formatPhone,
  getContactTypeLabel,
  getContactTypeColor,
  getLabelText,
  getLabelVariant,
  timeAgo,
} from '@/lib/utils'
import type { Contact, Message } from '@/types'

interface ContactCardProps {
  contact: Contact & { lastMessage?: Message | null }
  onClick?: () => void
  selected?: boolean
}

export default function ContactCard({ contact, onClick, selected }: ContactCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5 ${
        selected ? 'border-primary-500 shadow-medium' : 'border-transparent shadow-soft'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-primary-600 text-sm font-bold">{getInitials(contact.name)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-900 text-sm truncate">{contact.name}</p>
            <div className="flex-shrink-0">
              <Badge
                label={getLabelText(contact.label)}
                variant={getLabelVariant(contact.label) as 'default' | 'success' | 'warning' | 'error' | 'info'}
                dot
              />
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-0.5">{formatPhone(contact.phone)}</p>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              label={getContactTypeLabel(contact.type)}
              variant={getContactTypeColor(contact.type) as 'default' | 'success' | 'warning' | 'error' | 'info'}
            />
          </div>

          {contact.assignedTo && (
            <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {contact.assignedTo.name}
            </p>
          )}

          {contact.lastMessage && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-slate-400 text-xs truncate">
                {contact.lastMessage.direction === 'OUTBOUND' ? '✓ ' : ''}
                {contact.lastMessage.content}
              </p>
              <p className="text-slate-300 text-xs mt-0.5">{timeAgo(contact.lastMessage.createdAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
