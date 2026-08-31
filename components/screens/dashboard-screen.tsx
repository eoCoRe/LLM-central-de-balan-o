"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Sparkline } from "@/components/sparkline"
import {
  PERIODS,
  accountTotalByName,
  deltaPercent,
  formatBRL,
  formatRatio,
  INDICATORS,
  type Period,
} from "@/lib/financial-data"
import { cn } from "@/lib/utils"

const CURRENT: Period = "1T2026"
const PREVIOUS: Period = "1T2025"

const liquidezCorrente = INDICATORS.find((i) => i.name === "Liquidez Corrente")!

function TrendBadge({ delta, invert = false }: { delta: number; invert?: boolean }) {
  const up = delta >= 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-xs tabular-nums",
        good ? "bg-ok-muted text-ok" : "bg-risk-muted text-risk",
      )}
    >
      <Icon className="size-3" />
      {up ? "+" : ""}
      {formatBRL(delta, 1)}%
    </span>
  )
}

function KpiCard({
  label,
  value,
  unit,
  delta,
}: {
  label: string
  value: string
  unit: string
  delta: number
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <TrendBadge delta={delta} />
        <span className="text-xs text-muted-foreground">vs. período anterior</span>
      </div>
    </div>
  )
}

const ALERTS = [
  {
    tone: "risk" as const,
    title: "Endividamento elevado",
    detail: "Capital de terceiros financia mais de 54% do ativo total.",
  },
  {
    tone: "attention" as const,
    title: "Estoques em crescimento",
    detail: "Estoques subiram 10,7% em relação a 4T2024, acima da receita.",
  },
  {
    tone: "ok" as const,
    title: "Liquidez corrente estável",
    detail: "Índice acima de 1,5 em todos os períodos analisados.",
  },
]

const toneDot: Record<string, string> = {
  risk: "bg-risk",
  attention: "bg-attention",
  ok: "bg-ok",
}

export function DashboardScreen() {
  const ativo = accountTotalByName("Ativo", CURRENT)
  const passivoTotal =
    accountTotalByName("Passivo Circulante", CURRENT) +
    accountTotalByName("Exigível a Longo Prazo", CURRENT)
  const pl = accountTotalByName("Patrimônio Líquido", CURRENT)
  const lc = liquidezCorrente.compute(CURRENT)

  const ativoPrev = accountTotalByName("Ativo", PREVIOUS)
  const passivoPrev =
    accountTotalByName("Passivo Circulante", PREVIOUS) + accountTotalByName("Exigível a Longo Prazo", PREVIOUS)
  const plPrev = accountTotalByName("Patrimônio Líquido", PREVIOUS)
  const lcPrev = liquidezCorrente.compute(PREVIOUS)

  const comparison = INDICATORS.slice(0, 4).map((ind) => ({
    name: ind.name,
    unit: ind.unit,
    values: PERIODS.map((p) => ind.compute(p)),
  }))

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        subtitle="Resumo da posição financeira e indicadores-chave do período 1T2026."
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Ativo Total" value={formatBRL(ativo, 0)} unit="mil BRL" delta={deltaPercent(ativo, ativoPrev)} />
          <KpiCard
            label="Passivo Total"
            value={formatBRL(passivoTotal, 0)}
            unit="mil BRL"
            delta={deltaPercent(passivoTotal, passivoPrev)}
          />
          <KpiCard label="Patrimônio Líquido" value={formatBRL(pl, 0)} unit="mil BRL" delta={deltaPercent(pl, plPrev)} />
          <KpiCard label="Liquidez Corrente" value={formatRatio(lc)} unit="índice" delta={deltaPercent(lc, lcPrev)} />
        </div>

        {/* Gráfico + Alertas */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Evolução</p>
            <h2 className="mt-1 text-sm font-semibold text-foreground">Liquidez Corrente</h2>
            <div className="mt-4 h-52">
              <Sparkline
                points={PERIODS.map((p) => liquidezCorrente.compute(p))}
                labels={[...PERIODS]}
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Alertas</p>
            <h2 className="mt-1 text-sm font-semibold text-foreground">Pontos de atenção</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {ALERTS.map((alert) => (
                <li key={alert.title} className="flex gap-3">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toneDot[alert.tone])} aria-hidden />
                  <div>
                    <p className="text-sm font-medium leading-tight text-foreground">{alert.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{alert.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabela de comparação */}
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Comparativo</p>
            <h2 className="mt-1 text-sm font-semibold text-foreground">Indicadores por período</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-2.5 text-left text-xs font-medium">Indicador</th>
                {PERIODS.map((p) => (
                  <th key={p} className="px-5 py-2.5 text-right text-xs font-medium tabular-nums">
                    {p}
                  </th>
                ))}
                <th className="px-5 py-2.5 text-right text-xs font-medium">Δ período</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => {
                const last = row.values[row.values.length - 1]
                const prev = row.values[row.values.length - 2]
                const delta = deltaPercent(last, prev)
                return (
                  <tr key={row.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 text-foreground">{row.name}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="px-5 py-2.5 text-right font-mono tabular-nums text-foreground">
                        {row.unit === "percent" ? `${formatBRL(val, 1)}%` : formatRatio(val)}
                      </td>
                    ))}
                    <td className="px-5 py-2.5 text-right">
                      <TrendBadge delta={delta} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
