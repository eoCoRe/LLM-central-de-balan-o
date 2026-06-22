/**
 * Limiar mínimo de confiança da extração por IA (RN03).
 *
 * Regra de negócio: todo valor extraído com confiança ABAIXO deste
 * percentual é considerado duvidoso e precisa de revisão humana antes
 * de entrar em qualquer cálculo ou ser gravado na Tabulação. Esse é o
 * mecanismo de "human-in-the-loop" exigido pelo RFC (§2.5, §5.5) para
 * mitigar o risco de alucinação do modelo em decisões de crédito.
 */
export const CONFIDENCE_REVIEW_THRESHOLD = 0.8

/** Indica se um valor extraído precisa ser revisado pelo analista antes de ser confirmado. */
export function requiresHumanReview(confidenceScore: number): boolean {
  return confidenceScore < CONFIDENCE_REVIEW_THRESHOLD
}

/** Formata o score de confiança (0–1) como percentual legível (ex.: 0.71 → "71%"). */
export function formatConfidenceAsPercentage(confidenceScore: number): string {
  return `${Math.round(confidenceScore * 100)}%`
}
