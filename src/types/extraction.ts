/**
 * Um valor extraído pela IA a partir do PDF do Balanço/DRE, antes de ser
 * confirmado pelo analista e gravado na Tabulação (RF06, RF08).
 */
export interface ExtractedAccountValue {
  /** Identificador único da linha extraída */
  id: string
  /** Nome da conta contábil (ex.: "Ativo Circulante") */
  accountName: string
  /** Valor extraído pela IA, em milhares de reais */
  valueInThousands: number
  /** Score de confiança da extração, de 0 a 1 (RF06) */
  confidenceScore: number
  /** Página do PDF de origem do valor, para rastreabilidade (RF06) */
  sourcePage: number
}

/** Identifica qual documento e cliente estão sendo revisados na tela. */
export interface ExtractionDocumentInfo {
  documentTitle: string
  clientName: string
}
