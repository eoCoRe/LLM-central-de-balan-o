import { ConfirmExtractionAction } from '../components/extraction/ConfirmExtractionAction'
import { ExtractionDocumentHeader } from '../components/extraction/ExtractionDocumentHeader'
import { ExtractionTable } from '../components/extraction/ExtractionTable'
import { mockDocumentInfo, mockExtractedValues } from '../data/mockExtractionData'
import { requiresHumanReview } from '../utils/confidence'

/**
 * Tela de Revisão da Extração (§4.5 do RFC).
 *
 * Ponto central do human-in-the-loop: depois que o LLM lê o PDF, o analista
 * confere os valores extraídos — com score de confiança e página de origem —
 * antes que eles populem a Tabulação (RF06, RF08, RN02, RN03).
 */
export function ExtractionReviewPage() {
  const pendingReviewCount = mockExtractedValues.filter((extractedValue) =>
    requiresHumanReview(extractedValue.confidenceScore),
  ).length

  function handleConfirmExtraction() {
    // TODO: chamar o endpoint de gravação na Tabulação (Conector da Tabulação, §5.3) quando disponível.
    console.log('Valores confirmados e enviados para a Tabulação.')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ExtractionDocumentHeader documentInfo={mockDocumentInfo} />
      <ExtractionTable extractedValues={mockExtractedValues} />
      <ConfirmExtractionAction pendingReviewCount={pendingReviewCount} onConfirm={handleConfirmExtraction} />
    </div>
  )
}
