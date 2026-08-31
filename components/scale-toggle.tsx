"use client"

import { SCALE_LABEL, type Scale } from "@/lib/financial-data"
import { cn } from "@/lib/utils"

const SCALES: Scale[] = ["unidade", "milhares", "milhoes"]

interface ScaleToggleProps {
  value: Scale
  onChange: (scale: Scale) => void
}

export function ScaleToggle({ value, onChange }: ScaleToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5" role="tablist" aria-label="Escala de valores">
      {SCALES.map((scale) => (
        <button
          key={scale}
          type="button"
          role="tab"
          aria-selected={value === scale}
          onClick={() => onChange(scale)}
          className={cn(
            "rounded-[calc(var(--radius)*0.6)] px-2.5 py-1 text-xs font-medium transition-colors",
            value === scale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {SCALE_LABEL[scale]}
        </button>
      ))}
    </div>
  )
}
