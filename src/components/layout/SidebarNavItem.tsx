interface SidebarNavItemProps {
  label: string
  icon: string
  isActive?: boolean
}

/** Um link de navegação da sidebar. Nesta etapa do projeto, os links são mockados (sem rota real). */
export function SidebarNavItem({ label, icon, isActive = false }: SidebarNavItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </a>
  )
}
