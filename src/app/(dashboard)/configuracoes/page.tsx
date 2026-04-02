'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import type { User, UserRole } from '@/types'
import { getRoleLabel, getInitials } from '@/lib/utils'

type Tab = 'clinica' | 'usuarios' | 'plano' | 'integracoes'

interface ClinicData {
  id: string
  name: string
  slug: string
  plan: string
  whatsappInstance?: string | null
  whatsappToken?: string | null
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('clinica')
  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Clinic form
  const [clinicName, setClinicName] = useState('')

  // WhatsApp
  const [waInstance, setWaInstance] = useState('')
  const [waToken, setWaToken] = useState('')
  const [waConnecting, setWaConnecting] = useState(false)
  const [waStatus, setWaStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected')

  // Invite user modal
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('THERAPIST')
  const [inviteSpecialty, setInviteSpecialty] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  async function loadData() {
    try {
      const [clinicRes, usersRes] = await Promise.all([
        fetch('/api/clinica'),
        fetch('/api/usuarios'),
      ])
      if (clinicRes.ok) {
        const data = await clinicRes.json()
        const c = data.clinic
        setClinic(c)
        setClinicName(c?.name || '')
        setWaInstance(c?.whatsappInstance || '')
        setWaToken(c?.whatsappToken || '')
        if (c?.whatsappInstance && c?.whatsappToken) {
          setWaStatus('connected')
        }
      }
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSaveClinic() {
    setSaving(true)
    try {
      const res = await fetch('/api/clinica', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clinicName }),
      })
      if (res.ok) {
        const data = await res.json()
        setClinic(data.clinic)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleConnectWhatsApp() {
    if (!waInstance || !waToken) return
    setWaConnecting(true)
    setWaStatus('connecting')
    try {
      const res = await fetch('/api/clinica/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappInstance: waInstance, whatsappToken: waToken }),
      })
      if (res.ok) {
        setWaStatus('connected')
      } else {
        setWaStatus('disconnected')
      }
    } catch {
      setWaStatus('disconnected')
    } finally {
      setWaConnecting(false)
    }
  }

  async function handleInviteUser() {
    if (!inviteName || !inviteEmail || !invitePassword) return
    setInviteLoading(true)
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          password: invitePassword,
          role: inviteRole,
          specialty: inviteSpecialty || undefined,
        }),
      })
      if (res.ok) {
        setShowInviteModal(false)
        setInviteName('')
        setInviteEmail('')
        setInvitePassword('')
        setInviteSpecialty('')
        loadData()
      }
    } catch (error) {
      console.error('Erro ao convidar usuário:', error)
    } finally {
      setInviteLoading(false)
    }
  }

  const tabs: { value: Tab; label: string }[] = [
    { value: 'clinica', label: 'Clínica' },
    { value: 'usuarios', label: 'Usuários' },
    { value: 'plano', label: 'Plano' },
    { value: 'integracoes', label: 'Integrações' },
  ]

  const planInfo: Record<string, { label: string; color: string; features: string[] }> = {
    ESSENCIAL: {
      label: 'Essencial',
      color: 'bg-slate-100 text-slate-700',
      features: ['2 usuários', '500 contatos', 'Inbox WhatsApp'],
    },
    CLINICA: {
      label: 'Clínica',
      color: 'bg-primary-100 text-primary-700',
      features: ['10 usuários', '5.000 contatos', 'Inbox multi-canal', 'Relatórios'],
    },
    REDE: {
      label: 'Rede',
      color: 'bg-amber-100 text-amber-700',
      features: ['Ilimitado', 'Multi-unidades', 'API personalizada'],
    },
  }

  return (
    <div>
      <Topbar title="Configurações" />

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-white text-slate-900 shadow-soft'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'clinica' && (
          <div className="max-w-2xl">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Informações da Clínica</h3>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-slate-200 rounded-xl" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="label">Nome da Clínica</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Slug (identificador único)</label>
                    <input
                      type="text"
                      value={clinic?.slug || ''}
                      disabled
                      className="input bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">O slug não pode ser alterado após o cadastro.</p>
                  </div>
                  <div>
                    <label className="label">Plano atual</label>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${planInfo[clinic?.plan || 'ESSENCIAL']?.color}`}>
                        {planInfo[clinic?.plan || 'ESSENCIAL']?.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveClinic}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="max-w-4xl">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Usuários da Clínica</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Convidar Usuário
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuário</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Perfil</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Especialidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <span className="text-primary-600 text-xs font-bold">{getInitials(user.name)}</span>
                              </div>
                              <span className="font-medium text-slate-900 text-sm">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge
                              label={getRoleLabel(user.role)}
                              variant={user.role === 'ADMIN' ? 'error' : user.role === 'MANAGER' ? 'warning' : 'info'}
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {user.specialty || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'plano' && (
          <div className="max-w-4xl">
            <div className="card mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Plano Atual</h3>
              <p className="text-slate-500 text-sm mb-4">Você está no plano <strong>{planInfo[clinic?.plan || 'ESSENCIAL']?.label}</strong></p>
              <div className="flex flex-wrap gap-2">
                {planInfo[clinic?.plan || 'ESSENCIAL']?.features.map((f) => (
                  <span key={f} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-4">Fazer Upgrade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { plan: 'ESSENCIAL', price: 'R$97/mês', features: ['2 usuários', '500 contatos', 'Inbox WhatsApp', 'Agenda básica'] },
                { plan: 'CLINICA', price: 'R$197/mês', features: ['10 usuários', '5.000 contatos', 'Inbox multi-canal', 'Agenda avançada', 'Relatórios'], recommended: true },
                { plan: 'REDE', price: 'R$397/mês', features: ['Usuários ilimitados', 'Contatos ilimitados', 'Multi-unidades', 'API personalizada', 'Suporte prioritário'] },
              ].map(({ plan, price, features, recommended }) => {
                const isCurrent = clinic?.plan === plan
                return (
                  <div
                    key={plan}
                    className={`rounded-2xl border-2 p-5 ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-slate-200'} ${recommended && !isCurrent ? 'relative' : ''}`}
                  >
                    {recommended && !isCurrent && (
                      <span className="absolute -top-3 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Recomendado
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900">{planInfo[plan]?.label}</p>
                        <p className="text-primary-600 font-bold text-lg mt-1">{price}</p>
                      </div>
                      {isCurrent && (
                        <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'btn-primary'}`}
                    >
                      {isCurrent ? 'Plano atual' : 'Fazer upgrade'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'integracoes' && (
          <div className="max-w-2xl space-y-6">
            {/* WhatsApp via Z-API */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">WhatsApp via Z-API</h3>
                      <p className="text-slate-400 text-sm">Conecte seu WhatsApp Business</p>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
                  waStatus === 'connected' ? 'bg-green-100 text-green-700' :
                  waStatus === 'connecting' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    waStatus === 'connected' ? 'bg-green-500' :
                    waStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                    'bg-slate-400'
                  }`} />
                  {waStatus === 'connected' ? 'Conectado' : waStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">ID da Instância Z-API</label>
                  <input
                    type="text"
                    value={waInstance}
                    onChange={(e) => setWaInstance(e.target.value)}
                    className="input"
                    placeholder="Ex: 3CDB43A6..."
                  />
                </div>
                <div>
                  <label className="label">Token Z-API</label>
                  <input
                    type="password"
                    value={waToken}
                    onChange={(e) => setWaToken(e.target.value)}
                    className="input"
                    placeholder="Seu token de autenticação"
                  />
                </div>

                <button
                  onClick={handleConnectWhatsApp}
                  disabled={waConnecting || !waInstance || !waToken}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {waConnecting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {waStatus === 'connected' ? 'Atualizar Conexão' : 'Conectar WhatsApp'}
                    </>
                  )}
                </button>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-blue-700 text-sm font-medium mb-1">Como configurar:</p>
                  <ol className="text-blue-600 text-xs space-y-1 list-decimal list-inside">
                    <li>Acesse seu painel Z-API em z-api.io</li>
                    <li>Crie ou selecione uma instância</li>
                    <li>Copie o Instance ID e o Token</li>
                    <li>Cole nos campos acima e clique em Conectar</li>
                    <li>Configure o webhook para: /api/whatsapp/webhook</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Convidar Usuário"
        confirmLabel="Criar Usuário"
        onConfirm={handleInviteUser}
        confirmLoading={inviteLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="input"
              placeholder="Nome do profissional"
            />
          </div>
          <div>
            <label className="label">E-mail *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input"
              placeholder="email@clinica.com.br"
            />
          </div>
          <div>
            <label className="label">Senha inicial *</label>
            <input
              type="password"
              value={invitePassword}
              onChange={(e) => setInvitePassword(e.target.value)}
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Perfil</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="input"
              >
                <option value="THERAPIST">Terapeuta</option>
                <option value="RECEPTIONIST">Recepcionista</option>
                <option value="MANAGER">Gerente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="label">Especialidade</label>
              <select
                value={inviteSpecialty}
                onChange={(e) => setInviteSpecialty(e.target.value)}
                className="input"
              >
                <option value="">Nenhuma</option>
                <option value="FONOAUDIOLOGIA">Fonoaudiologia</option>
                <option value="TERAPIA_OCUPACIONAL">Terapia Ocupacional</option>
                <option value="PSICOLOGIA">Psicologia</option>
                <option value="ABA">ABA</option>
                <option value="PSICOMOTRICIDADE">Psicomotricidade</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
