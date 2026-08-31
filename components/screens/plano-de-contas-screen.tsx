"use client"

import { useState } from "react"
import { ChevronRight, GripVertical, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ScaleToggle } from "@/components/scale-toggle"
import { Button } from "@/components/ui/button"
import {
  CHART_OF_ACCOUNTS,
  PERIODS,
  formatScaled,
  sumAccount,
  type Account,
  type Scale,
} from "@/lib/financial-data"
import { cn } from "@/lib/utils"

interface TreeRowProps {
  account: Account
  depth: number
  expanded: Set<string>
  onToggle: (code: string) => void
}

function TreeRow({ account, depth, expanded, onToggle }: TreeRowProps) {
  const hasChildren = !!account.children?.length
  const isOpen = expanded.has(account.code)
  const isRoot = depth === 0

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md py-1.5 pr-2 transition-colors hover:bg-primary/[0.04]",
          isRoot && "bg-primary/[0.03]",
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60" />

        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(account.code)}
            className="flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isOpen ? "Recolher" : "Expandir"}
            aria-expanded={isOpen}
          >
            <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}

        <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{account.code}</span>
        <span
          className={cn(
            "flex-1 truncate text-sm",
            isRoot ? "font-semibold text-foreground" : hasChildren ? "font-medium text-foreground" : "text-foreground",
          )}
        >
          {account.name}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            hasChildren ? "bg-muted text-muted-foreground" : "border border-border text-muted-foreground",
          )}
        >
          {hasChildren ? "Grupo" : "Analítica"}
        </span>
      </div>

      {hasChildren &&
        isOpen &&
        account.children!.map((child) => (
          <TreeRow key={child.code} account={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
        ))}
    </>
  )
}

interface PreviewRowProps {
  account: Account
  depth: number
  scale: Scale
}

function flattenForPreview(accounts: Account[], depth = 0): { account: Account; depth: number }[] {
  return accounts.flatMap((account) => [
    { account, depth },
    ...(account.children ? flattenForPreview(account.children, depth + 1) : []),
  ])
}

function PreviewRow({ account, depth, scale }: PreviewRowProps) {
  const hasChildren = !!account.children?.length
  const isRoot = depth === 0
  return (
    <tr className={cn("border-b border-border last:border-0", isRoot && "bg-primary/[0.03]")}>
      <td className="py-1.5 pr-2 text-xs" style={{ paddingLeft: `${depth * 14 + 12}px` }}>
        <span
          className={cn(
            "text-foreground",
            isRoot ? "font-semibold" : hasChildren ? "font-medium" : "text-muted-foreground",
          )}
        >
          {account.name}
        </span>
      </td>
      <td
        className={cn(
          "py-1.5 pr-3 text-right font-mono text-xs tabular-nums",
          hasChildren ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {formatScaled(sumAccount(account, PERIODS[PERIODS.length - 1]), scale)}
      </td>
    </tr>
  )
}

export function PlanoDeContasScreen() {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["1", "1.1", "2", "2.1", "2.3"]),
  )
  const [scale, setScale] = useState<Scale>("milhares")

  const toggle = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const previewRows = flattenForPreview(CHART_OF_ACCOUNTS)

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Estrutura"
        title="Plano de Contas"
        subtitle="Organize a hierarquia de contas contábeis que estrutura a tabulação."
        actions={
          <>
            <ScaleToggle value={scale} onChange={setScale} />
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="size-3.5" />
              Grupo raiz
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1fr_384px]">
        {/* Árvore */}
        <div className="border-b border-border px-8 py-6 xl:border-b-0 xl:border-r">
          <div className="rounded-md border border-border bg-card p-2">
            {CHART_OF_ACCOUNTS.map((account) => (
              <TreeRow key={account.code} account={account} depth={0} expanded={expanded} onToggle={toggle} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Passe o mouse sobre uma linha para reordenar. Contas analíticas recebem valores na Tabulação.
          </p>
        </div>

        {/* Preview */}
        <aside className="px-8 py-6 xl:px-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Preview da Tabulação</p>
          <h2 className="mt-1 text-sm font-semibold text-foreground">Estrutura como tabela</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pl-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Conta
                  </th>
                  <th className="py-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {PERIODS[PERIODS.length - 1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map(({ account, depth }) => (
                  <PreviewRow key={account.code} account={account} depth={depth} scale={scale} />
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  )
}
