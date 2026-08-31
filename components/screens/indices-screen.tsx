"use client"

import { useMemo } from "react"
import { Info, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useFinancialStore } from "@/lib/store"
import {
  computeDre,
  formatIndicatorValue,
  INDICATORS,
  makeIndicatorContext,
  type Indicator,
  type IndicatorContext,
} from "@/lib/financial-data"
import { sectorBenchmarkFor, SECTORS } from "@/lib/sector-benchmarks"
import { cn } from "@/lib/utils"

type BenchmarkComparison = "acima" | "abaixo" | "indisponivel"

function compareToBenchmark(indicator: Indicator, value: number | undefined, benchmark: number | undefined): BenchmarkComparison {
  if (value === undefined || benchmark === undefined) return "indisponivel"
  if (value === benchmark) return indicator.higherIsBetter ? "acima" : "abaixo"
  return value > benchmark ? "acima" : "abaixo"
}

function BenchmarkChip({ indicator, comparison }: { indicator: Indicator; comparison: BenchmarkComparison }) {
  if (comparison === "indisponivel") {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const isGood = comparison === "acima" ? indicator.higherIsBetter : !indicator.higherIsBetter
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
        isGood ? "bg-ok-muted text-ok" : "bg-risk-muted text-risk",
      )}
    >
      {comparison === "acima" ? "▲ Acima da média" : "▼ Abaixo da média"}
    </span>
  )
}

export function IndicesScreen() {
  const store = useFinancialStore()
  const exercicioIds = useMemo(() => store.exercicios.map((e) => e.id), [store.exercicios])
  const lastPeriod = exercicioIds[exercicioIds.length - 1]

  const ctxByPeriod = useMemo(() => {
    const out: Record<string, IndicatorContext> = {}
    for (const id of exercicioIds) {
      out[id] = makeIndicatorContext(store.accounts, computeDre(store.dreByExercicio[id] ?? {}), id)
    }
    return out
  }, [exercicioIds, store.accounts, store.dreByExercicio])

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Análise"
        title="Índices Financeiros"
        subtitle="Indicadores calculados a partir das contas do Plano de Contas, por período, comparados à média do setor."
        actions={
          <>
            <label htmlFor="setor-select" className="text-xs text-muted-foreground">
              Setor
            </label>
            <select
              id="setor-select"
              value={store.sectorId}
              onChange={(e) => store.setSector(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
            >
              {SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="size-3.5" />
              Novo índice
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-5 px-8 py-6">
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Nome
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Fórmula
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Grupo
                </th>
                {exercicioIds.map((id) => (
                  <th
                    key={id}
                    className="w-28 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {id}
                  </th>
                ))}
                <th className="w-28 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Média do Setor
                </th>
                <th className="w-36 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Vs. Setor ({lastPeriod ?? "—"})
                </th>
              </tr>
            </thead>
            <tbody>
              {INDICATORS.map((indicator) => {
                const benchmark = sectorBenchmarkFor(store.sectorId, indicator.id)
                const lastValue = lastPeriod ? indicator.compute(ctxByPeriod[lastPeriod]) : undefined
                const comparison = compareToBenchmark(indicator, lastValue, benchmark)
                return (
                  <tr key={indicator.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{indicator.name}</td>
                    <td className="px-4 py-3">
                      <code className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-xs leading-relaxed text-muted-foreground">
                        {indicator.formula}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {indicator.group}
                      </span>
                    </td>
                    {exercicioIds.map((id) => (
                      <td key={id} className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                        {formatIndicatorValue(indicator, indicator.compute(ctxByPeriod[id]))}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                      {formatIndicatorValue(indicator, benchmark)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BenchmarkChip indicator={indicator} comparison={comparison} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Dica */}
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Use{" "}
            <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
              [Nome da Conta]
            </code>{" "}
            para referenciar contas do Plano de Contas nas fórmulas. Operadores{" "}
            <code className="font-mono text-xs text-foreground">+ − × /</code> e parênteses são suportados. A
            “Média do Setor” é uma referência ilustrativa cadastrada por setor — ajuste em{" "}
            <code className="font-mono text-xs text-foreground">lib/sector-benchmarks.ts</code> conforme a fonte
            disponível.
          </p>
        </div>
      </div>
    </div>
  )
}
