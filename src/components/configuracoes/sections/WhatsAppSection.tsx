'use client'

import { useState } from 'react'

export default function WhatsAppSection() {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('connected')
  const [showToken, setShowToken] = useState(false)
  const [instanceId, setInstanceId] = useState('3D9F2A···')
  const [token, setToken] = useState('sk-zapi-9f2a3d')

  return (
    <div className="space-y-4">
      {/* Status overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'connected' ? 'bg-[#EAF3DE]' : 'bg-[#FEECEC]'}`}>
            <svg className={`w-5 h-5 ${status === 'connected' ? 'text-green-700' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Integração WhatsApp via Z-API</h3>
            <p className="text-xs text-gray-400 mt-0.5">Conecte seu número de WhatsApp Business</p>
          </div>
        </div>

        {status === 'connected' ? (
          <div className="flex items-center gap-2 p-3 bg-[#EAF3DE] rounded-lg mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-xs font-medium text-green-800">Conectado</span>
            <span className="text-xs text-green-700">— (63) 9xxxx-xxxx</span>
            <button className="ml-auto text-xs text-green-700 underline hover:text-green-900" onClick={() => setStatus('disconnected')}>
              Desconectar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-[#FEECEC] rounded-lg mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs font-medium text-red-800">Desconectado</span>
            <button className="ml-auto text-xs text-red-700 underline hover:text-red-900" onClick={() => setStatus('connected')}>
              Reconectar
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Instance ID
            </label>
            <input
              type="text"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 pr-9 w-full focus:outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showToken
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {status === 'connected' && (
            <button className="text-xs text-[#4F5FE0] border border-[#4F5FE0] px-3 py-1.5 rounded-lg hover:bg-[#EEF0FC] transition-colors">
              Testar conexão
            </button>
          )}
          <button
            className="text-sm font-medium text-white px-4 py-2 rounded-lg"
            style={{ background: '#4F5FE0' }}
          >
            Salvar credenciais
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-[#EEF0FC] border border-[#C5CBEF] rounded-xl p-4">
        <p className="text-xs font-semibold text-[#3C3489] mb-2">Como configurar</p>
        <ol className="text-xs text-[#4F5FE0] space-y-1 list-decimal list-inside">
          <li>Acesse o painel da Z-API e crie uma instância</li>
          <li>Copie o Instance ID e o Token gerados</li>
          <li>Cole os dados nos campos acima e salve</li>
          <li>O QR Code aparecerá automaticamente para escanear com o WhatsApp</li>
        </ol>
      </div>
    </div>
  )
}
