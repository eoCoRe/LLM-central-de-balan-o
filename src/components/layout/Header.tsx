/** Barra superior fixa, presente em todas as telas da plataforma. */
export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <span className="text-lg font-semibold text-slate-900">Central de Balanços</span>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>Ana Souza</span>
        <div className="h-8 w-8 rounded-full bg-slate-200" aria-hidden="true" />
      </div>
    </header>
  )
}
