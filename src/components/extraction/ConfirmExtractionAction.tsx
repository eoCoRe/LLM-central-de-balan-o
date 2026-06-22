import { PrimaryButton } from '../ui/PrimaryButton'

interface ConfirmExtractionActionProps {
  pendingReviewCount: number
  onConfirm: () => void
}

/**
 * Ação final do fluxo human-in-the-loop (RN02): a gravação na Tabulação só
 * acontece depois que o analista confirma os valores extraídos pela IA.
 */
export function ConfirmExtractionAction({ pendingReviewCount, onConfirm }: ConfirmExtractionActionProps) {
  const hasPendingReview = pendingReviewCount > 0

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        {hasPendingReview
          ? `${pendingReviewCount} valor(es) com baixa confiança precisam de revisão antes de confirmar.`
          : 'Todos os valores foram validados pela IA.'}
      </p>
      <PrimaryButton onClick={onConfirm}>[ Confirmar e enviar para a Tabulação ]</PrimaryButton>
    </div>
  )
}
