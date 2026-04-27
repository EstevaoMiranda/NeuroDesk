'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import ConfigSidebar from '@/components/configuracoes/ConfigSidebar'
import type { ConfigSection } from '@/components/configuracoes/ConfigSidebar'
import ClinicaSection from '@/components/configuracoes/sections/ClinicaSection'
import PlanoSection from '@/components/configuracoes/sections/PlanoSection'
import WhatsAppSection from '@/components/configuracoes/sections/WhatsAppSection'
import IASection from '@/components/configuracoes/sections/IASection'
import NotificacoesSection from '@/components/configuracoes/sections/NotificacoesSection'
import UsuariosSection from '@/components/configuracoes/sections/UsuariosSection'

const SECTION_TITLES: Record<ConfigSection, string> = {
  clinica:      'Clínica',
  plano:        'Plano e cobrança',
  whatsapp:     'WhatsApp / Z-API',
  ia:           'Agente IA',
  notificacoes: 'Notificações',
  usuarios:     'Usuários e acessos',
}

function ActiveSection({ section }: { section: ConfigSection }) {
  switch (section) {
    case 'clinica':      return <ClinicaSection />
    case 'plano':        return <PlanoSection />
    case 'whatsapp':     return <WhatsAppSection />
    case 'ia':           return <IASection />
    case 'notificacoes': return <NotificacoesSection />
    case 'usuarios':     return <UsuariosSection />
  }
}

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<ConfigSection>('clinica')

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Configurações" />

      <div className="flex-1 p-6">
        <div className="flex gap-6 items-start">
          <div className="w-52 flex-shrink-0">
            <ConfigSidebar active={active} onChange={setActive} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {SECTION_TITLES[active]}
            </h2>
            <ActiveSection section={active} />
          </div>
        </div>
      </div>
    </div>
  )
}
