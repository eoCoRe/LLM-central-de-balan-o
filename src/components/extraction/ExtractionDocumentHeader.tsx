import type { ExtractionDocumentInfo } from '../../types/extraction'

interface ExtractionDocumentHeaderProps {
  documentInfo: ExtractionDocumentInfo
}

/** Identifica, no topo da tela, qual documento e cliente estão sendo revisados. */
export function ExtractionDocumentHeader({ documentInfo }: ExtractionDocumentHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-slate-900">Revisão da Extração</h1>
      <p className="mt-1 text-sm text-slate-600">
        {documentInfo.documentTitle} — {documentInfo.clientName}
      </p>
    </div>
  )
}
