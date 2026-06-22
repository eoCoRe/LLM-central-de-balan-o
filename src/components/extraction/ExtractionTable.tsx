import type { ExtractedAccountValue } from '../../types/extraction'
import { ExtractionTableRow } from './ExtractionTableRow'

interface ExtractionTableProps {
  extractedValues: ExtractedAccountValue[]
}

const HEADER_CELL_CLASS = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500'

/** Tabela com os valores extraídos pela IA, pendentes de confirmação pelo analista. */
export function ExtractionTable({ extractedValues }: ExtractionTableProps) {
  return (
    <table className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      <thead className="bg-slate-50">
        <tr>
          <th className={`${HEADER_CELL_CLASS} text-left`}>Conta</th>
          <th className={`${HEADER_CELL_CLASS} text-right`}>Valor (R$ mil)</th>
          <th className={`${HEADER_CELL_CLASS} text-right`}>Conf.</th>
          <th className={`${HEADER_CELL_CLASS} text-center`}>Origem</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {extractedValues.map((extractedValue) => (
          <ExtractionTableRow key={extractedValue.id} extractedValue={extractedValue} />
        ))}
      </tbody>
    </table>
  )
}
