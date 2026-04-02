'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Plan } from '@/types'

const plans = [
  {
    value: 'ESSENCIAL' as Plan,
    label: 'Essencial',
    price: 'R$97',
    period: '/mês',
    features: ['Até 2 usuários', '500 contatos', 'Inbox WhatsApp', 'Agenda básica'],
    color: 'border-slate-200 hover:border-primary-300',
    selectedColor: 'border-primary-600 bg-primary-50',
    badge: null,
  },
  {
    value: 'CLINICA' as Plan,
    label: 'Clínica',
    price: 'R$197',
    period: '/mês',
    features: ['Até 10 usuários', '5.000 contatos', 'Inbox multi-canal', 'Agenda avançada', 'Relatórios'],
    color: 'border-slate-200 hover:border-primary-300',
    selectedColor: 'border-primary-600 bg-primary-50',
    badge: 'Mais popular',
  },
  {
    value: 'REDE' as Plan,
    label: 'Rede',
    price: 'R$397',
    period: '/mês',
    features: ['Usuários ilimitados', 'Contatos ilimitados', 'Multi-unidades', 'API personalizada', 'Suporte prioritário'],
    color: 'border-slate-200 hover:border-primary-300',
    selectedColor: 'border-primary-600 bg-primary-50',
    badge: null,
  },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [clinicName, setClinicName] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<Plan>('CLINICA')

  function validateStep1() {
    if (!clinicName.trim()) return 'Informe o nome da clínica.'
    if (!userName.trim()) return 'Informe seu nome.'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Digite um e-mail válido.'
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (password !== confirmPassword) return 'As senhas não coincidem.'
    return ''
  }

  function handleNext() {
    const validationError = validateStep1()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep(2)
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName,
          userName,
          email,
          password,
          plan: selectedPlan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta. Tente novamente.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro ao conectar ao servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-primary-700 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">NeuroDesk</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Comece sua jornada</h1>
          <p className="text-indigo-200">Crie a conta da sua clínica em poucos minutos</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-white text-primary-700' : 'bg-white/20 text-white'}`}>1</div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-white text-primary-700' : 'bg-white/20 text-white'}`}>2</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-large p-8">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Dados da clínica e acesso</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Nome da Clínica</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="input"
                    placeholder="Ex: Clínica Bem Estar"
                  />
                </div>
                <div>
                  <label className="label">Seu Nome</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="input"
                    placeholder="Dr(a). Nome Sobrenome"
                  />
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="seu@email.com.br"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Senha</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="label">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button onClick={handleNext} className="w-full btn-primary py-3 text-base mt-2">
                  Próximo passo
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-slate-900">Escolha seu plano</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan.value}
                    onClick={() => setSelectedPlan(plan.value)}
                    className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${selectedPlan === plan.value ? plan.selectedColor : plan.color}`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === plan.value ? 'border-primary-600 bg-primary-600' : 'border-slate-300'}`}>
                            {selectedPlan === plan.value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-lg">{plan.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 ml-8">
                          {plan.features.map((f) => (
                            <span key={f} className="text-slate-600 text-sm flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                        <span className="text-slate-500 text-sm">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando sua conta...
                  </>
                ) : (
                  'Criar conta e começar'
                )}
              </button>

              <p className="text-center text-slate-400 text-xs mt-4">
                Ao criar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-indigo-200 text-sm mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-white font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
