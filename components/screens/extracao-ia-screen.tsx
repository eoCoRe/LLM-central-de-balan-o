"use client"

import { FileText, Sparkles, Upload } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

const STEPS = [
  { title: "Envie o documento", detail: "PDF ou imagem do balanço, DRE ou balancete do cliente." },
  { title: "Extração automática", detail: "A IA identifica contas, valores e períodos do documento." },
  { title: "Revise e concilie", detail: "Confira o mapeamento sugerido para o Plano de Contas." },
]

export function ExtracaoIaScreen() {
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Complementar"
        title="Extração via IA"
        subtitle="Transforme demonstrações em PDF ou imagem em dados estruturados de tabulação."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3" />
            beta
          </span>
        }
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        {/* Área de upload */}
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Arraste um arquivo ou selecione do computador</p>
          <p className="mt-1 text-xs text-muted-foreground">Formatos suportados: PDF, PNG, JPG · até 20 MB</p>
          <Button size="sm" className="mt-4 gap-1.5">
            <FileText className="size-3.5" />
            Selecionar arquivo
          </Button>
        </div>

        {/* Como funciona */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-md border border-border bg-card p-4">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
              <p className="mt-2 text-sm font-medium text-foreground">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
