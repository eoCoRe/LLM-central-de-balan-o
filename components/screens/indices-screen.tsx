"use client"

import { useMemo } from "react"
import { Info, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useFinancialStore } from "@/lib/store"
import { computeDre, formatIndicatorValue, INDICATORS, makeIndicatorContext, type IndicatorContext } from "@/lib/financial-data"

export function IndicesScreen() {
  const store = useFinancialStore()
  const exercicioIds = useMemo(() => store.exercicios.map((e) => e.id), [store.exercicios])

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
        subtitle="Indicadores calculados a partir das contas do Plano de Contas, por período."
        actions={
          <Button size="sm" className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            Novo índice
          </Button>
        }
      />

      <div className="flex flex-col gap-5 px-8 py-6">
        <div className="overflow-hidden rounded-md border border-border bg-card">
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
              </tr>
            </thead>
            <tbody>
              {INDICATORS.map((indicator) => (
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
                </tr>
              ))}
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
            <code className="font-mono text-xs text-foreground">+ − × /</code> e parênteses são suportados.
          </p>
        </div>
      </div>
    </div>
  )
}
