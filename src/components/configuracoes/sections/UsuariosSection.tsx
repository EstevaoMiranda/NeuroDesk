'use client'

import { useState } from 'react'

interface AppUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  initials: string
  color: string
}

const INITIAL_USERS: AppUser[] = [
  { id: 'u1', name: 'Lucas Miranda',   email: 'lucas@terap.com.br',   role: 'Admin',         isActive: true,  initials: 'LM', color: '#4F5FE0' },
  { id: 'u2', name: 'Ana Beatriz',     email: 'ana@terap.com.br',     role: 'Profissional',  isActive: true,  initials: 'AB', color: '#1B9E5A' },
  { id: 'u3', name: 'Fernanda Santos', email: 'fernanda@terap.com.br', role: 'Profissional',  isActive: true,  initials: 'FS', color: '#7B5FE0' },
  { id: 'u4', name: 'Carlos Lima',     email: 'carlos@terap.com.br',  role: 'Profissional',  isActive: false, initials: 'CL', color: '#E09B10' },
]

export default function UsuariosSection() {
  const [users] = useState<AppUser[]>(INITIAL_USERS)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Usuários e acessos</h3>
            <p className="text-xs text-gray-400 mt-0.5">{users.length} usuários na clínica</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg"
            style={{ background: '#4F5FE0' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Convidar usuário
          </button>
        </div>

        {/* Table */}
        <div>
          <div className="grid grid-cols-[1fr_1fr_100px_72px] px-5 py-2 bg-gray-50 border-b border-gray-100">
            {['Nome', 'Email', 'Papel', 'Status'].map((h) => (
              <p key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</p>
            ))}
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_1fr_100px_72px] items-center px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                  style={{ background: user.color }}
                >
                  {user.initials}
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
              </div>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
              <span className="text-xs text-gray-600">{user.role}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-center w-fit ${
                  user.isActive
                    ? 'bg-[#EAF3DE] text-[#27500A]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {user.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Convidar usuário</h2>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="usuario@clinica.com.br"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowInvite(false); setInviteEmail('') }}
                className="flex-1 py-2 text-sm font-medium text-white rounded-lg"
                style={{ background: '#4F5FE0' }}
              >
                Enviar convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
