import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, ListTree, Table2, FileSpreadsheet, Percent, Sparkles, Gavel } from "lucide-react"

export type ScreenId =
  | "dashboard"
  | "plano-de-contas"
  | "tabulacao"
  | "demonstracoes"
  | "indices"
  | "opiniao-de-venda"
  | "extracao-ia"

export interface NavItem {
  id: ScreenId
  label: string
  icon: LucideIcon
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plano-de-contas", label: "Plano de Contas", icon: ListTree },
  { id: "tabulacao", label: "Tabulação", icon: Table2 },
  { id: "demonstracoes", label: "Balanço · DRE · DFC", icon: FileSpreadsheet },
  { id: "indices", label: "Índices Financeiros", icon: Percent },
  { id: "opiniao-de-venda", label: "Opinião de Venda", icon: Gavel },
]

export const COMPLEMENTAR_NAV: NavItem[] = [
  { id: "extracao-ia", label: "Extração via IA", icon: Sparkles, badge: "beta" },
]
