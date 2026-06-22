import { formatConfidenceAsPercentage, requiresHumanReview } from '../../utils/confidence'

interface ConfidenceBadgeProps {
  confidenceScore: number
}

/**
 * Exibe o score de confiança da IA com um indicador visual (✓ ou ⚠).
 * A regra de "baixa confiança" vive em utils/confidence.ts como única
 * fonte de verdade sobre o limiar de revisão (RN03).
 */
export function ConfidenceBadge({ confidenceScore }: ConfidenceBadgeProps) {
  const needsReview = requiresHumanReview(confidenceScore)

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        needsReview ? 'text-amber-700' : 'text-emerald-700'
      }`}
    >
      {formatConfidenceAsPercentage(confidenceScore)}
      <span aria-hidden="true">{needsReview ? '⚠' : '✓'}</span>
    </span>
  )
}
