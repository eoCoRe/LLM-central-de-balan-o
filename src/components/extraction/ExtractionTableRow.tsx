import type { ExtractedAccountValue } from '../../types/extraction'
import { requiresHumanReview } from '../../utils/confidence'
import { formatThousandsValue } from '../../utils/formatCurrency'
import { ConfidenceBadge } from '../ui/ConfidenceBadge'

interface ExtractionTableRowProps {
  extractedValue: ExtractedAccountValue
}

export function ExtractionTableRow({ extractedValue }: ExtractionTableRowProps) {
  // RN03 — valores extraídos com confiança abaixo do limiar (CONFIDENCE_REVIEW_THRESHOLD)
  // não podem entrar em nenhum cálculo até serem confirmados pelo analista. Por isso a
  // linha recebe um destaque visual (fundo amarelo) que chama atenção para a revisão.
  const needsReview = requiresHumanReview(extractedValue.confidenceScore)

  return (
    <tr className={needsReview ? 'bg-amber-50' : undefined}>
      <td className="px-4 py-3 text-sm text-slate-800">
        <div className="flex items-center gap-2">
          {extractedValue.accountName}
          {needsReview && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Revisar
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-800">
        {formatThousandsValue(extractedValue.valueInThousands)}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <ConfidenceBadge confidenceScore={extractedValue.confidenceScore} />
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate-500">{`p.${extractedValue.sourcePage}`}</td>
    </tr>
  )
}
