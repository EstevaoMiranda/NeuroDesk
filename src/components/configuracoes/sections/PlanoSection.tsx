const CHECK = (
  <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const DASH = <span className="text-gray-300 block text-center">—</span>

const FEATURES = [
  { label: 'WhatsApp CRM',         essencial: true, clinica: true, rede: true },
  { label: 'Agente IA',            essencial: true, clinica: true, rede: true },
  { label: 'Agendamentos',         essencial: false, clinica: true, rede: true },
  { label: 'Lembretes automáticos',essencial: false, clinica: true, rede: true },
  { label: 'Gestão de AT',         essencial: false, clinica: true, rede: true },
  { label: 'Portal do paciente',   essencial: false, clinica: false, rede: true },
  { label: 'Multi-unidade',        essencial: false, clinica: false, rede: true },
]

export default function PlanoSection() {
  return (
    <div className="space-y-4">
      {/* Current plan card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Plano atual</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
          {[
            { label: 'Plano',              value: 'Essencial' },
            { label: 'Valor',              value: 'R$149/mês' },
            { label: 'Próxima cobrança',   value: '27/05/2025' },
            { label: 'Status',             value: 'Ativo' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
        <button
          className="w-full text-sm font-medium text-white py-2.5 rounded-lg transition-colors"
          style={{ background: '#4F5FE0' }}
        >
          Fazer upgrade para Clínica — R$349/mês
        </button>
      </div>

      {/* Comparison table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px_80px] border-b border-gray-100">
          <div className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Funcionalidade</div>
          {[
            { label: 'Essencial', price: 'R$149' },
            { label: 'Clínica',   price: 'R$349' },
            { label: 'Rede',      price: 'R$699' },
          ].map((plan) => (
            <div key={plan.label} className="p-3 text-center">
              <p className="text-xs font-semibold text-gray-700">{plan.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{plan.price}</p>
            </div>
          ))}
        </div>
        {FEATURES.map((f) => (
          <div key={f.label} className="grid grid-cols-[1fr_80px_80px_80px] border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="p-3 text-xs text-gray-600">{f.label}</div>
            <div className="p-3 flex items-center justify-center">{f.essencial ? CHECK : DASH}</div>
            <div className="p-3 flex items-center justify-center">{f.clinica  ? CHECK : DASH}</div>
            <div className="p-3 flex items-center justify-center">{f.rede     ? CHECK : DASH}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
