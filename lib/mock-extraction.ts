import { collectLeaves, type Account } from "./financial-data"

export interface ExtractedRow {
  id: string
  code: string | null
  suggestedName: string
  value: number
  confidence: number
  page: number
}

// Confiabilidades fixas (uma propositalmente baixa) para sempre exercitar a fila de
// revisão humana na demo, independente dos dados reais do Plano de Contas.
const CONFIDENCES = [97, 94, 91, 62, 88, 96]

// Simula a saída do "Extrator LLM + Mapeador de Contas": pega até 6 contas analíticas
// do Plano de Contas, gera um valor plausível (com pequena variação sobre o último valor
// já tabulado, ou um placeholder se não houver) e uma confiança — mais uma linha
// propositalmente não reconhecida, para exercitar o mapeamento manual (RN: conta_id
// nullable em VALOR_EXTRAIDO). Determinístico (sem Math.random) para reprodutibilidade.
export function generateMockExtraction(accounts: Account[], baselineExercicioId: string | undefined): ExtractedRow[] {
  const leaves = collectLeaves(accounts).slice(0, 6)

  const rows: ExtractedRow[] = leaves.map((account, i) => {
    const base = baselineExercicioId ? account.values?.[baselineExercicioId] : undefined
    const baseValue = base ?? 1000 + i * 350
    const variationPct = ((i * 37) % 21) - 10 // -10%..+10%, determinístico
    const value = Math.round(baseValue * (1 + variationPct / 100))
    return {
      id: `ext-${account.code}`,
      code: account.code,
      suggestedName: account.name,
      value,
      confidence: CONFIDENCES[i] ?? 90,
      page: i < 3 ? 1 : 2,
    }
  })

  rows.push({
    id: "ext-unmatched",
    code: null,
    suggestedName: "Adiantamento a Fornecedores",
    value: 640,
    confidence: 68,
    page: 2,
  })

  return rows
}
