import type { ExtractedAccountValue, ExtractionDocumentInfo } from '../types/extraction'

/**
 * Dados mockados representando o resultado de uma extração via LLM,
 * conforme o exemplo de tela do RFC (§4.5): Balanço 1º Tri 2026, Cliente XYZ.
 */
export const mockDocumentInfo: ExtractionDocumentInfo = {
  documentTitle: 'Balanço 1º Tri 2026',
  clientName: 'Cliente XYZ',
}

export const mockExtractedValues: ExtractedAccountValue[] = [
  {
    id: 'ativo-circulante',
    accountName: 'Ativo Circulante',
    valueInThousands: 148533,
    confidenceScore: 0.98,
    sourcePage: 3,
  },
  {
    id: 'estoques',
    accountName: 'Estoques',
    valueInThousands: 12040,
    confidenceScore: 0.71,
    sourcePage: 3,
  },
  {
    id: 'passivo-circulante',
    accountName: 'Passivo Circulante',
    valueInThousands: 189166,
    confidenceScore: 0.96,
    sourcePage: 4,
  },
  {
    id: 'patrimonio-liquido',
    accountName: 'Patrimônio Líquido',
    valueInThousands: 446372,
    confidenceScore: 0.97,
    sourcePage: 5,
  },
]
