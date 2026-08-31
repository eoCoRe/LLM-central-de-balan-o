"use client"

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useFinancialStore } from "@/lib/store"
import { flattenAccounts, formatBRL } from "@/lib/financial-data"
import { generateMockExtraction, type ExtractedRow } from "@/lib/mock-extraction"
import { cn } from "@/lib/utils"

type Stage = "idle" | "uploading" | "extracting" | "reviewing" | "done"

interface ReviewRow extends ExtractedRow {
  mappedCode: string | null
  confirmedValue: number
}

function confidenceStatus(confidence: number): "ok" | "atencao" | "risco" {
  if (confidence >= 90) return "ok"
  if (confidence >= 75) return "atencao"
  return "risco"
}

const STEPS = [
  { title: "Envie o documento", detail: "PDF ou imagem do balanço, DRE ou balancete do cliente." },
  { title: "Extração automática", detail: "A IA identifica contas, valores e períodos do documento." },
  { title: "Revise e concilie", detail: "Confira o mapeamento sugerido para o Plano de Contas." },
]

export function ExtracaoIaScreen({ onNavigate }: { onNavigate: (id: "tabulacao") => void }) {
  const store = useFinancialStore()
  const [stage, setStage] = useState<Stage>("idle")
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [exercicioId, setExercicioId] = useState<string>("")
  const [confirmedCount, setConfirmedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const pending = timeouts.current
    return () => {
      pending.forEach(clearTimeout)
    }
  }, [])

  const leafOptions = flattenAccounts(store.accounts).filter((r) => !r.account.children)

  function startExtraction(file: File) {
    setFileName(file.name)
    setStage("uploading")
    const lastExercicioId = store.exercicios[store.exercicios.length - 1]?.id
    setExercicioId(lastExercicioId ?? "")

    timeouts.current.push(
      setTimeout(() => {
        setStage("extracting")
        timeouts.current.push(
          setTimeout(() => {
            const extracted = generateMockExtraction(store.accounts, lastExercicioId)
            setRows(
              extracted.map((row) => ({
                ...row,
                mappedCode: row.code,
                confirmedValue: row.value,
              })),
            )
            setStage("reviewing")
          }, 1100),
        )
      }, 700),
    )
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) startExtraction(file)
    e.target.value = ""
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) startExtraction(file)
  }

  function updateRow(id: string, patch: Partial<ReviewRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function handleConfirm() {
    const entries = rows
      .filter((r) => r.mappedCode)
      .map((r) => ({ code: r.mappedCode as string, value: r.confirmedValue }))
    if (entries.length === 0 || !exercicioId || !fileName) return
    store.confirmExtraction(exercicioId, entries, fileName)
    setConfirmedCount(entries.length)
    setStage("done")
  }

  function reset() {
    setStage("idle")
    setFileName(null)
    setRows([])
  }

  const mappedCount = rows.filter((r) => r.mappedCode).length
  const lowConfidenceCount = rows.filter((r) => confidenceStatus(r.confidence) !== "ok").length

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Complementar"
        title="Extração via IA"
        subtitle="Transforme demonstrações em PDF ou imagem em dados estruturados de tabulação."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3" />
            demo
          </span>
        }
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        {stage === "idle" && (
          <>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-14 text-center transition-colors",
                isDragOver ? "border-ring bg-primary/[0.04]" : "border-border bg-card",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Upload className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Arraste um arquivo ou selecione do computador</p>
              <p className="mt-1 text-xs text-muted-foreground">Formatos suportados: PDF, PNG, JPG · até 20 MB</p>
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <FileText className="size-3.5" />
                Selecionar arquivo
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-md border border-border bg-card p-4">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
                  <p className="mt-2 text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Demonstração: o conteúdo do arquivo enviado não é lido — a extração abaixo usa dados de exemplo para
              ilustrar o fluxo de revisão humana (mapeamento de contas, confiança e conciliação com a Tabulação).
            </p>
          </>
        )}

        {(stage === "uploading" || stage === "extracting") && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-20 text-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {stage === "uploading" ? `Enviando "${fileName}"…` : "IA identificando contas, valores e páginas…"}
            </p>
            <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos.</p>
          </div>
        )}

        {stage === "reviewing" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <FileText className="size-4 text-muted-foreground" />
                {fileName}
                <span className="text-xs text-muted-foreground">
                  · {rows.length} item(ns) extraído(s)
                  {lowConfidenceCount > 0 && `, ${lowConfidenceCount} para revisão`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="ext-exercicio" className="text-xs text-muted-foreground">
                  Gravar em
                </label>
                <select
                  id="ext-exercicio"
                  value={exercicioId}
                  onChange={(e) => setExercicioId(e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-ring"
                >
                  {store.exercicios.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Conta (sugestão da IA)
                    </th>
                    <th className="w-24 px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Página
                    </th>
                    <th className="w-28 px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Confiança
                    </th>
                    <th className="w-36 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Extraído
                    </th>
                    <th className="w-40 px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Confirmado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const status = confidenceStatus(row.confidence)
                    return (
                      <tr key={row.id} className="border-b border-border last:border-0 align-top">
                        <td className="px-4 py-3">
                          {row.code ? (
                            <div>
                              <span className="mr-1.5 font-mono text-xs text-muted-foreground">{row.code}</span>
                              <span className="text-foreground">{row.suggestedName}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <span className="inline-flex w-fit items-center gap-1 rounded bg-risk-muted px-1.5 py-0.5 text-[11px] font-medium text-risk">
                                <AlertTriangle className="size-3" />
                                "{row.suggestedName}" não reconhecida
                              </span>
                              <select
                                value={row.mappedCode ?? ""}
                                onChange={(e) => updateRow(row.id, { mappedCode: e.target.value || null })}
                                className="h-7 rounded border border-border bg-background px-1.5 text-xs text-foreground outline-none focus:border-ring"
                              >
                                <option value="">Mapear para uma conta…</option>
                                {leafOptions.map(({ account }) => (
                                  <option key={account.code} value={account.code}>
                                    {account.code} — {account.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs tabular-nums text-muted-foreground">
                          {row.page}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs tabular-nums",
                              status === "ok" && "bg-ok-muted text-ok",
                              status === "atencao" && "bg-attention-muted text-attention",
                              status === "risco" && "bg-risk-muted text-risk",
                            )}
                          >
                            {row.confidence}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {formatBRL(row.value, 0)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.confirmedValue}
                            onChange={(e) => {
                              const num = Number.parseFloat(e.target.value.replace(/\./g, "").replace(",", "."))
                              updateRow(row.id, { confirmedValue: Number.isNaN(num) ? 0 : num })
                            }}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-right font-mono text-sm tabular-nums text-foreground outline-none focus:border-ring"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {mappedCount} de {rows.length} linha(s) serão gravadas — mapeie as pendentes ou remova-as ignorando o
                valor.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <X className="size-3.5" />
                  Cancelar
                </Button>
                <Button size="sm" disabled={mappedCount === 0 || !exercicioId} onClick={handleConfirm}>
                  <Check className="size-3.5" />
                  Confirmar {mappedCount} valor(es) para {exercicioId || "—"}
                </Button>
              </div>
            </div>
          </>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-ok/30 bg-ok-muted px-6 py-16 text-center">
            <CheckCircle2 className="size-8 text-ok" />
            <p className="text-sm font-medium text-ok">
              {confirmedCount} valor(es) gravado(s) em {exercicioId} a partir de "{fileName}".
            </p>
            <p className="text-xs text-ok/70">
              Os lançamentos aparecem na Tabulação e já entram no cálculo dos índices e da Opinião de Venda.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                Nova extração
              </Button>
              <Button size="sm" onClick={() => onNavigate("tabulacao")}>
                Ver na Tabulação
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
