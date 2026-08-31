interface SparklineProps {
  points: number[]
  labels: string[]
  height?: number
}

// Sparkline simples (série de 3 períodos) desenhada em SVG responsivo.
export function Sparkline({ points, labels, height = 200 }: SparklineProps) {
  const width = 640
  const padX = 28
  const padY = 24
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coords = points.map((value, i) => {
    const x = padX + (i * (width - padX * 2)) / (points.length - 1)
    const y = padY + (height - padY * 2) * (1 - (value - min) / range)
    return { x, y }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ")
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Evolução da liquidez corrente ao longo dos períodos"
    >
      {/* Linhas de grade horizontais */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={width - padX}
          y1={padY + (height - padY * 2) * t}
          y2={padY + (height - padY * 2) * t}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}

      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-foreground)]" stopOpacity={0.08} />
          <stop offset="100%" className="[stop-color:var(--color-foreground)]" stopOpacity={0} />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={linePath} fill="none" className="stroke-foreground" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={4} className="fill-background stroke-foreground" strokeWidth={2} />
          <text x={c.x} y={c.y - 12} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
            {points[i].toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </text>
          <text x={c.x} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}
