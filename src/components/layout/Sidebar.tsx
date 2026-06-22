import { SidebarNavItem } from './SidebarNavItem'

const NAVIGATION_ITEMS = [
  { label: 'Visão Geral', icon: '🏠' },
  { label: 'Plano de Contas', icon: '🗂️' },
  { label: 'Tabulação', icon: '📋', isActive: true },
  { label: 'DRE / Balanço', icon: '📊' },
  { label: 'Índices Financeiros', icon: '%' },
]

/**
 * Navegação lateral da plataforma. A Revisão da Extração é acessada a partir
 * da Tabulação (§4 do RFC), por isso esse item aparece como ativo aqui.
 */
export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4">
      <nav className="flex flex-col gap-1">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
      </nav>
    </aside>
  )
}
