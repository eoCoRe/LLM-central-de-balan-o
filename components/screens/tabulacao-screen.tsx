"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ScaleToggle } from "@/components/scale-toggle"
import {
  CHART_OF_ACCOUNTS,
  PERIODS,
  formatScaled,
  type Account,
  type Period,
  type Scale,
  type ValuesByPeriod,
} from "@/lib/financial-data"
import { cn } from "@/lib/utils"

type LeafState = Record<string, ValuesByPeriod>

function collectLeaves(accounts: Account[], acc: LeafState = {}): LeafState {
  for (const account of accounts) {
    if (account.values) acc[account.code] = { ...account.values }
    if (account.children) collectLeaves(account.children, acc)
  }
  return acc
}

function sumFromState(account: Account, period: Period, state: LeafState): number {
  if (account.values) return state[account.code]?.[period] ?? 0
  if (account.children) return account.children.reduce((s, c) => s + sumFromState(c, period, state), 0)
  return 0
}

interface FlatRow {
  account: Account
  depth: number
  isLeaf: boolean
  isRoot: boolean
}

function flatten(accounts: Account[], depth = 0, out: FlatRow[] = []): FlatRow[] {
  for (const account of accounts) {
    out.push({ account, depth, isLeaf: !account.children, isRoot: depth === 0 })
    if (account.children) flatten(account.children, depth + 1, out)
  }
  return out
}

export function TabulacaoScreen() {
  const [state, setState] = useState<LeafState>(() => collectLeaves(CHART_OF_ACCOUNTS))
  const [scale, setScale] = useState<Scale>("milhares")

  const rows = useMemo(() => flatten(CHART_OF_ACCOUNTS), [])

  const ativo = CHART_OF_ACCOUNTS.find((a) => a.name === "Ativo")!
  const passivo = CHART_OF_ACCOUNTS.find((a) => a.name === "Passivo")!

  const checks = PERIODS.map((p) => {
    const a = sumFromState(ativo, p, state)
    const passivoTotal = sumFromState(passivo, p, state)
    return { period: p, ativo: a, passivo: passivoTotal, ok: a === passivoTotal, diff: a - passivoTotal }
  })

  const updateValue = (code: string, period: Period, raw: string) => {
    const num = Number.parseFloat(raw.replace(/\./g, "").replace(",", "."))
    setState((prev) => ({
      ...prev,
      [code]: { ...prev[code], [period]: Number.isNaN(num) ? 0 : num },
    }))
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Lançamentos"
        title="Tabulação"
        subtitle="Informe os valores das contas analíticas por período. Os grupos são somados automaticamente."
        actions={<ScaleToggle value={scale} onChange={setScale} />}
      />

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="max-h-[calc(100dvh-19rem)] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-card">
                  <th className="sticky left-0 z-20 bg-card px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Conta
                  </th>
                  {PERIODS.map((p) => (
                    <th
                      key={p}
                      className="w-40 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ account, depth, isLeaf, isRoot }) => (
                  <tr
                    key={account.code}
                    className={cn(
                      "border-b border-border last:border-0",
                      isRoot && "bg-primary/[0.03]",
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-[1] bg-card px-4 py-1.5",
                        isRoot && "bg-[oklch(0.985_0_0)]",
                      )}
                      style={{ paddingLeft: `${depth * 18 + 16}px` }}
                    >
                      <span className="mr-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                        {account.code}
                      </span>
                      <span
                        className={cn(
                          "text-foreground",
                          isRoot ? "font-semibold" : !isLeaf ? "font-medium" : "",
                        )}
                      >
                        {account.name}
                      </span>
                    </td>
                    {PERIODS.map((p) => (
                      <td key={p} className="px-2 py-1">
                        {isLeaf ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            value={state[account.code]?.[p] ?? 0}
                            onChange={(e) => updateValue(account.code, p, e.target.value)}
                            className="w-full rounded-[calc(var(--radius)*0.6)] border border-transparent bg-transparent px-2 py-1 text-right font-mono text-sm tabular-nums text-foreground outline-none transition-colors hover:border-border focus:border-ring focus:bg-background"
                            aria-label={`${account.name} — ${p}`}
                          />
                        ) : (
                          <div
                            className={cn(
                              "px-2 py-1 text-right font-mono text-sm tabular-nums text-foreground",
                              isRoot ? "font-semibold" : "font-medium",
                            )}
                          >
                            {formatScaled(sumFromState(account, p, state), scale)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé: verificação de consistência */}
          <div className="flex flex-col gap-2 border-t border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Consistência Ativo × Passivo
            </p>
            <div className="flex flex-wrap gap-2">
              {checks.map((c) => (
                <span
                  key={c.period}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums",
                    c.ok
                      ? "border-ok/30 bg-ok-muted text-ok"
                      : "border-risk/30 bg-risk-muted text-risk",
                  )}
                >
                  {c.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  {c.period}
                  {!c.ok && <span className="font-sans">· Δ {formatScaled(c.diff, scale)}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
