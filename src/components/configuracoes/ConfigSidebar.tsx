export type ConfigSection =
  | 'clinica'
  | 'plano'
  | 'whatsapp'
  | 'ia'
  | 'notificacoes'
  | 'usuarios'

const SECTIONS = [
  {
    group: 'Conta',
    items: [
      { id: 'clinica' as ConfigSection,  label: 'Clínica' },
      { id: 'plano' as ConfigSection,    label: 'Plano e cobrança' },
    ],
  },
  {
    group: 'Integrações',
    items: [
      { id: 'whatsapp' as ConfigSection, label: 'WhatsApp / Z-API' },
      { id: 'ia' as ConfigSection,       label: 'Agente IA' },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { id: 'notificacoes' as ConfigSection, label: 'Notificações' },
      { id: 'usuarios' as ConfigSection,     label: 'Usuários e acessos' },
    ],
  },
]

interface Props {
  active: ConfigSection
  onChange: (id: ConfigSection) => void
}

export default function ConfigSidebar({ active, onChange }: Props) {
  return (
    <nav className="flex flex-col gap-4">
      {SECTIONS.map((group) => (
        <div key={group.group}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
            {group.group}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  active === item.id
                    ? 'bg-[#EEF0FC] text-[#4F5FE0] font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
