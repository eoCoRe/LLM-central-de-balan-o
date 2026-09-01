import { CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { GLOSSARY } from '@/lib/glossary'
import { cn } from '@/lib/utils'

// Envolve um termo contábil com uma dica em linguagem simples, se ele existir no
// glossário. Sem entrada correspondente, renderiza o texto puro (fallback seguro).
export function GlossaryTerm({ term, className }: { term: string; className?: string }) {
  const definition = GLOSSARY[term]
  if (!definition) return <span className={className}>{term}</span>

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              'inline-flex items-center gap-1 border-b border-dotted border-muted-foreground/50 text-left outline-none',
              className,
            )}
          />
        }
      >
        {term}
        <CircleHelp className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{definition}</TooltipContent>
    </Tooltip>
  )
}
