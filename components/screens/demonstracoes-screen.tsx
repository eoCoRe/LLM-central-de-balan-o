"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ScaleToggle } from "@/components/scale-toggle"
import {
  CHART_OF_ACCOUNTS,
  DFC,
  DRE,
  PERIODS,
  formatScaled,
  sumAccount,
  type Account,
  type DreLine,
  type Scale,
} from "@/lib/financial-data"
import { cn } from "@/lib/utils"

type SubTab = "balanco" | "dre" | "dfc" | "balancete"

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "balanco", label: "Balanço" },
  { id: "dre", label: "DRE" },
  { id: "dfc", label: "DFC" },
  { id: "balancete", label: "Balancete" },
]

function flatten(accounts: Account[], depth = 0, out: { account: Account; depth: number }[] = []) {
  for (const account of accounts) {
    out.push({ account, depth })
    if (account.children) flatten(account.children, depth + 1, out)
  }
  return out
}

function collectLeaves(accounts: Account[], out: Account[] = []) {
  for (const account of accounts) {
    if (account.values) out.push(account)
    if (account.children) collectLeaves(account.children, out)
  }
  return out
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

function Head() {
  return (
    <thead>
      <tr className="border-b border-border">
        <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Descrição
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
  )
}

function BalancoTable({ scale }: { scale: Scale }) {
  const rows = flatten(CHART_OF_ACCOUNTS)
  return (
    <TableShell>
      <Head />
      <tbody>
        {rows.map(({ account, depth }) => {
          const hasChildren = !!account.children?.length
          const isRoot = depth === 0
          return (
            <tr
              key={account.code}
              className={cn(
                "border-b border-border last:border-0",
                isRoot && "bg-primary/[0.03]",
                isRoot && "border-t-2 border-t-border first:border-t-0",
              )}
            >
              <td className="px-4 py-1.5" style={{ paddingLeft: `${depth * 18 + 16}px` }}>
                <span
                  className={cn(
                    "text-foreground",
                    isRoot ? "font-semibold uppercase tracking-wide" : hasChildren ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {account.name}
                </span>
              </td>
              {PERIODS.map((p) => (
                <td
                  key={p}
                  className={cn(
                    "px-4 py-1.5 text-right font-mono tabular-nums",
                    hasChildren ? "font-semibold text-foreground" : "text-muted-foreground",
                    isRoot && "underline decoration-border decoration-2 underline-offset-4",
                  )}
                >
                  {formatScaled(sumAccount(account, p), scale)}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </TableShell>
  )
}

function StatementTable({ lines, scale }: { lines: DreLine[]; scale: Scale }) {
  return (
    <TableShell>
      <Head />
      <tbody>
        {lines.map((line) => {
          const isTotal = line.kind === "total"
          const isSubtotal = line.kind === "subtotal"
          return (
            <tr
              key={line.name}
              className={cn(
                "border-b border-border last:border-0",
                isTotal && "bg-primary/[0.03]",
              )}
            >
              <td
                className={cn(
                  "px-4 py-1.5 text-foreground",
                  isTotal ? "font-semibold" : isSubtotal ? "font-medium" : line.deduction ? "text-muted-foreground" : "",
                )}
              >
                {line.name}
              </td>
              {PERIODS.map((p) => (
                <td
                  key={p}
                  className={cn(
                    "px-4 py-1.5 text-right font-mono tabular-nums",
                    isTotal
                      ? "font-semibold text-foreground underline decoration-border decoration-2 underline-offset-4"
                      : isSubtotal
                        ? "font-medium text-foreground"
                        : line.values[p] < 0
                          ? "text-risk"
                          : "text-muted-foreground",
                  )}
                >
                  {formatScaled(line.values[p], scale)}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </TableShell>
  )
}

function BalanceteTable({ scale }: { scale: Scale }) {
  const leaves = collectLeaves(CHART_OF_ACCOUNTS)
  const p = PERIODS[PERIODS.length - 1]
  return (
    <TableShell>
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Código
          </th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Conta
          </th>
          <th className="w-40 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Saldo {p}
          </th>
        </tr>
      </thead>
      <tbody>
        {leaves.map((account) => (
          <tr key={account.code} className="border-b border-border last:border-0">
            <td className="px-4 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">{account.code}</td>
            <td className="px-4 py-1.5 text-foreground">{account.name}</td>
            <td className="px-4 py-1.5 text-right font-mono tabular-nums text-foreground">
              {formatScaled(sumAccount(account, p), scale)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

export function DemonstracoesScreen() {
  const [tab, setTab] = useState<SubTab>("balanco")
  const [scale, setScale] = useState<Scale>("milhares")

  const ativo = CHART_OF_ACCOUNTS.find((a) => a.name === "Ativo")!
  const passivo = CHART_OF_ACCOUNTS.find((a) => a.name === "Passivo")!
  const checks = PERIODS.map((p) => ({
    period: p,
    ok: sumAccount(ativo, p) === sumAccount(passivo, p),
  }))

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Demonstrações consolidadas"
        title="Balanço · DRE · DFC"
        subtitle="Visualização consolidada e somente leitura das demonstrações por período."
        actions={<ScaleToggle value={scale} onChange={setScale} />}
      />

      {/* Sub-abas */}
      <div className="border-b border-border px-8">
        <div className="flex gap-1" role="tablist" aria-label="Demonstração">
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors",
                tab === t.id
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {tab === "balanco" && <BalancoTable scale={scale} />}
        {tab === "dre" && <StatementTable lines={DRE} scale={scale} />}
        {tab === "dfc" && <StatementTable lines={DFC} scale={scale} />}
        {tab === "balancete" && <BalanceteTable scale={scale} />}
      </div>

      {/* Barra escura de verificação */}
      {(tab === "balanco" || tab === "balancete") && (
        <div className="mt-auto">
          <div className="mx-8 mb-6 flex flex-col gap-3 rounded-md bg-primary px-5 py-3.5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-primary-foreground/70">
              Check Ativo × Passivo
            </span>
            <div className="flex flex-wrap gap-4">
              {checks.map((c) => (
                <span key={c.period} className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full",
                      c.ok ? "bg-ok text-ok-foreground" : "bg-risk text-risk-foreground",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                  {c.period}
                  <span className="text-primary-foreground/60">{c.ok ? "OK" : "Inconsistente"}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
