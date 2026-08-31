// Modelo de dados da Central de Balanços
// Valores em milhares de BRL (unidade base). A escala é aplicada na exibição.

export const PERIODS = ["4T2024", "1T2025", "1T2026"] as const
export type Period = (typeof PERIODS)[number]

export type ValuesByPeriod = Record<Period, number>

export interface Account {
  code: string
  name: string
  // Contas folha possuem valores; grupos têm o total calculado a partir dos filhos.
  values?: ValuesByPeriod
  children?: Account[]
}

export const COMPANY = {
  name: "Farmácia Bem-Estar Ltda",
  cnpj: "12.345.678/0001-90",
}

function v(a: number, b: number, c: number): ValuesByPeriod {
  return { "4T2024": a, "1T2025": b, "1T2026": c }
}

// Plano de Contas — padrão contábil brasileiro
export const CHART_OF_ACCOUNTS: Account[] = [
  {
    code: "1",
    name: "Ativo",
    children: [
      {
        code: "1.1",
        name: "Ativo Circulante",
        children: [
          { code: "1.1.01", name: "Disponibilidades", values: v(850, 920, 1050) },
          { code: "1.1.02", name: "Aplicações Financeiras", values: v(1200, 1350, 1500) },
          { code: "1.1.03", name: "Contas a Receber de Clientes", values: v(3200, 3450, 3800) },
          { code: "1.1.04", name: "Estoques", values: v(2800, 2950, 3100) },
          { code: "1.1.05", name: "Outros Créditos", values: v(450, 480, 520) },
        ],
      },
      {
        code: "1.2",
        name: "Ativo Realizável a Longo Prazo",
        children: [
          { code: "1.2.01", name: "Aplicações Financeiras LP", values: v(600, 650, 700) },
          { code: "1.2.02", name: "Depósitos Judiciais", values: v(300, 320, 350) },
        ],
      },
      {
        code: "1.3",
        name: "Ativo Permanente",
        children: [
          { code: "1.3.01", name: "Imobilizado", values: v(4200, 4100, 4400) },
          { code: "1.3.02", name: "Intangível", values: v(800, 850, 900) },
        ],
      },
    ],
  },
  {
    code: "2",
    name: "Passivo",
    children: [
      {
        code: "2.1",
        name: "Passivo Circulante",
        children: [
          { code: "2.1.01", name: "Fornecedores", values: v(3100, 3300, 3500) },
          { code: "2.1.02", name: "Empréstimos e Financiamentos", values: v(1800, 1900, 2000) },
          { code: "2.1.03", name: "Obrigações Tributárias", values: v(700, 750, 820) },
        ],
      },
      {
        code: "2.2",
        name: "Exigível a Longo Prazo",
        children: [{ code: "2.2.01", name: "Empréstimos LP", values: v(2400, 2500, 2600) }],
      },
      {
        code: "2.3",
        name: "Patrimônio Líquido",
        children: [
          { code: "2.3.01", name: "Capital Social", values: v(5000, 5000, 5000) },
          { code: "2.3.02", name: "Reservas de Lucros", values: v(1400, 1620, 2400) },
        ],
      },
    ],
  },
]

// DRE — Demonstração do Resultado do Exercício
export interface DreLine {
  name: string
  values: ValuesByPeriod
  kind: "line" | "subtotal" | "total"
  deduction?: boolean
}

export const DRE: DreLine[] = [
  { name: "Receita Bruta", values: v(22000, 5800, 6300), kind: "line" },
  { name: "(-) Deduções da Receita", values: v(-4000, -1000, -1100), kind: "line", deduction: true },
  { name: "Receita Líquida", values: v(18000, 4800, 5200), kind: "subtotal" },
  { name: "(-) Custo das Mercadorias Vendidas", values: v(-12600, -3360, -3640), kind: "line", deduction: true },
  { name: "Lucro Bruto", values: v(5400, 1440, 1560), kind: "subtotal" },
  { name: "(-) Despesas Operacionais", values: v(-3600, -960, -1000), kind: "line", deduction: true },
  { name: "Resultado Operacional (EBIT)", values: v(1800, 480, 560), kind: "subtotal" },
  { name: "(+/-) Resultado Financeiro", values: v(-400, -110, -120), kind: "line" },
  { name: "Resultado Antes do IR/CSLL", values: v(1400, 370, 440), kind: "subtotal" },
  { name: "(-) IR/CSLL", values: v(-420, -111, -132), kind: "line", deduction: true },
  { name: "Lucro Líquido do Exercício", values: v(980, 259, 308), kind: "total" },
]

// DFC — Demonstração dos Fluxos de Caixa
export const DFC: DreLine[] = [
  { name: "Fluxo de Caixa Operacional", values: v(1500, 420, 500), kind: "subtotal" },
  { name: "Fluxo de Caixa de Investimentos", values: v(-800, -300, -400), kind: "subtotal" },
  { name: "Fluxo de Caixa de Financiamentos", values: v(-500, -50, 30), kind: "subtotal" },
  { name: "Variação Líquida de Caixa", values: v(200, 70, 130), kind: "total" },
  { name: "Caixa no Início do Período", values: v(650, 850, 920), kind: "line" },
  { name: "Caixa no Fim do Período", values: v(850, 920, 1050), kind: "total" },
]

// ---- Cálculos derivados ----

export function sumAccount(account: Account, period: Period): number {
  if (account.values) return account.values[period]
  if (account.children) {
    return account.children.reduce((acc, child) => acc + sumAccount(child, period), 0)
  }
  return 0
}

export function findAccountByName(name: string): Account | undefined {
  const stack = [...CHART_OF_ACCOUNTS]
  while (stack.length) {
    const node = stack.pop()!
    if (node.name === name) return node
    if (node.children) stack.push(...node.children)
  }
  return undefined
}

export function accountTotalByName(name: string, period: Period): number {
  const account = findAccountByName(name)
  return account ? sumAccount(account, period) : 0
}

function dreValue(name: string, period: Period): number {
  return DRE.find((l) => l.name === name)?.values[period] ?? 0
}

// Índices financeiros com fórmulas no padrão brasileiro
export type IndicatorType = "Liquidez" | "Endividamento" | "Estrutura" | "Rentabilidade" | "Atividade"

export interface Indicator {
  name: string
  formula: string
  type: IndicatorType
  unit: "ratio" | "percent"
  compute: (period: Period) => number
}

export const INDICATORS: Indicator[] = [
  {
    name: "Liquidez Corrente",
    formula: "[Ativo Circulante] / [Passivo Circulante]",
    type: "Liquidez",
    unit: "ratio",
    compute: (p) => accountTotalByName("Ativo Circulante", p) / accountTotalByName("Passivo Circulante", p),
  },
  {
    name: "Liquidez Geral",
    formula: "([Ativo Circulante] + [Ativo Realizável a Longo Prazo]) / ([Passivo Circulante] + [Exigível a Longo Prazo])",
    type: "Liquidez",
    unit: "ratio",
    compute: (p) =>
      (accountTotalByName("Ativo Circulante", p) + accountTotalByName("Ativo Realizável a Longo Prazo", p)) /
      (accountTotalByName("Passivo Circulante", p) + accountTotalByName("Exigível a Longo Prazo", p)),
  },
  {
    name: "Participação de Capital de Terceiros",
    formula: "([Passivo Circulante] + [Exigível a Longo Prazo]) / [Ativo]",
    type: "Endividamento",
    unit: "percent",
    compute: (p) =>
      ((accountTotalByName("Passivo Circulante", p) + accountTotalByName("Exigível a Longo Prazo", p)) /
        accountTotalByName("Ativo", p)) *
      100,
  },
  {
    name: "Imobilização do PL",
    formula: "[Ativo Permanente] / [Patrimônio Líquido]",
    type: "Estrutura",
    unit: "percent",
    compute: (p) => (accountTotalByName("Ativo Permanente", p) / accountTotalByName("Patrimônio Líquido", p)) * 100,
  },
  {
    name: "Margem Líquida",
    formula: "[Lucro Líquido] / [Receita Líquida] × 100",
    type: "Rentabilidade",
    unit: "percent",
    compute: (p) => (dreValue("Lucro Líquido do Exercício", p) / dreValue("Receita Líquida", p)) * 100,
  },
  {
    name: "Giro do Ativo",
    formula: "[Receita Líquida] / [Ativo]",
    type: "Atividade",
    unit: "ratio",
    compute: (p) => dreValue("Receita Líquida", p) / accountTotalByName("Ativo", p),
  },
]

// ---- Formatação brasileira ----

export type Scale = "unidade" | "milhares" | "milhoes"

export const SCALE_LABEL: Record<Scale, string> = {
  unidade: "Unidade",
  milhares: "Milhares",
  milhoes: "Milhões",
}

// Os valores base já estão em milhares. Convertemos para a escala escolhida.
export function applyScale(valueInThousands: number, scale: Scale): number {
  switch (scale) {
    case "unidade":
      return valueInThousands * 1000
    case "milhares":
      return valueInThousands
    case "milhoes":
      return valueInThousands / 1000
  }
}

export function formatBRL(value: number, decimals = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatScaled(valueInThousands: number, scale: Scale): string {
  const scaled = applyScale(valueInThousands, scale)
  const decimals = scale === "milhoes" ? 2 : 0
  return formatBRL(scaled, decimals)
}

export function formatRatio(value: number): string {
  return formatBRL(value, 2)
}

export function formatPercent(value: number): string {
  return `${formatBRL(value, 1)}%`
}

export function formatIndicator(indicator: Indicator, period: Period): string {
  const value = indicator.compute(period)
  return indicator.unit === "percent" ? formatPercent(value) : formatRatio(value)
}

export function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

// ---- Opinião de Venda (parecer de crédito) ----

export const LATEST_PERIOD: Period = PERIODS[PERIODS.length - 1]
export const PREVIOUS_PERIOD: Period = PERIODS[PERIODS.length - 2]

export type OpinionRating = "favoravel" | "ressalvas" | "desfavoravel"
export type CriterionStatus = "ok" | "atencao" | "risco"

export interface OpinionCriterion {
  label: string
  detail: string
  value: string
  status: CriterionStatus
  weight: number
  score: number // 0..100 do critério
}

export interface SalesOpinion {
  requestedValue: number // em reais
  suggestedLimit: number // em reais
  coverage: number // limite sugerido / valor solicitado
  score: number // 0..100 ponderado
  rating: OpinionRating
  ratingLabel: string
  headline: string
  criteria: OpinionCriterion[]
  narrative: string[]
}

export const RATING_LABEL: Record<OpinionRating, string> = {
  favoravel: "Favorável",
  ressalvas: "Favorável com ressalvas",
  desfavoravel: "Desfavorável",
}

function scoreBand(value: number, good: number, medium: number, higherIsBetter = true): CriterionStatus {
  if (higherIsBetter) {
    if (value >= good) return "ok"
    if (value >= medium) return "atencao"
    return "risco"
  }
  if (value <= good) return "ok"
  if (value <= medium) return "atencao"
  return "risco"
}

const STATUS_SCORE: Record<CriterionStatus, number> = { ok: 100, atencao: 60, risco: 20 }

// Limite de crédito sugerido, em reais, a partir da capacidade de geração de caixa e estrutura.
export function suggestedCreditLimit(period: Period = LATEST_PERIOD): number {
  const annualizedRevenue = dreValue("Receita Líquida", period) * 4 // trimestre → ano
  const pl = accountTotalByName("Patrimônio Líquido", period)
  const operatingCash = (DFC.find((l) => l.name === "Fluxo de Caixa Operacional")?.values[period] ?? 0) * 4
  // Conservador: menor entre 25% do faturamento anualizado, 1,2× PL e 3× geração de caixa anual.
  const candidates = [annualizedRevenue * 0.25, pl * 1.2, operatingCash * 3]
  const limitInThousands = Math.max(0, Math.min(...candidates))
  return Math.round(limitInThousands * 1000)
}

export function buildSalesOpinion(requestedValue: number, period: Period = LATEST_PERIOD): SalesOpinion {
  const liquidez = INDICATORS.find((i) => i.name === "Liquidez Corrente")!.compute(period)
  const endividamento = INDICATORS.find((i) => i.name === "Participação de Capital de Terceiros")!.compute(period)
  const margem = INDICATORS.find((i) => i.name === "Margem Líquida")!.compute(period)

  const lucroAtual = dreValue("Lucro Líquido do Exercício", period)
  const lucroAnterior = dreValue("Lucro Líquido do Exercício", PREVIOUS_PERIOD)
  const tendenciaLucro = deltaPercent(lucroAtual, lucroAnterior)

  const limit = suggestedCreditLimit(period)
  const coverage = requestedValue > 0 ? limit / requestedValue : 0

  const criteria: OpinionCriterion[] = [
    {
      label: "Liquidez Corrente",
      detail: "Capacidade de honrar obrigações de curto prazo",
      value: formatRatio(liquidez),
      status: scoreBand(liquidez, 1.5, 1.0, true),
      weight: 0.2,
      score: 0,
    },
    {
      label: "Endividamento",
      detail: "Participação de capital de terceiros sobre o ativo",
      value: formatPercent(endividamento),
      status: scoreBand(endividamento, 50, 70, false),
      weight: 0.2,
      score: 0,
    },
    {
      label: "Margem Líquida",
      detail: "Rentabilidade sobre a receita líquida",
      value: formatPercent(margem),
      status: scoreBand(margem, 5, 2, true),
      weight: 0.2,
      score: 0,
    },
    {
      label: "Tendência do Lucro",
      detail: `Variação vs ${PREVIOUS_PERIOD}`,
      value: `${tendenciaLucro >= 0 ? "+" : ""}${formatBRL(tendenciaLucro, 1)}%`,
      status: scoreBand(tendenciaLucro, 5, -5, true),
      weight: 0.15,
      score: 0,
    },
    {
      label: "Cobertura da Solicitação",
      detail: "Limite sugerido sobre o valor solicitado",
      value: requestedValue > 0 ? `${formatBRL(coverage, 2)}×` : "—",
      status: requestedValue > 0 ? scoreBand(coverage, 1, 0.75, true) : "atencao",
      weight: 0.25,
      score: 0,
    },
  ]

  for (const c of criteria) c.score = STATUS_SCORE[c.status]
  const score = Math.round(criteria.reduce((acc, c) => acc + c.score * c.weight, 0))

  let rating: OpinionRating
  if (score >= 70) rating = "favoravel"
  else if (score >= 45) rating = "ressalvas"
  else rating = "desfavoravel"

  const headline =
    rating === "favoravel"
      ? "Operação recomendada dentro do limite sugerido."
      : rating === "ressalvas"
        ? "Operação viável mediante condições e garantias adicionais."
        : "Operação não recomendada no valor solicitado."

  const narrative: string[] = []
  narrative.push(
    `A ${COMPANY.name} apresenta liquidez corrente de ${formatRatio(liquidez)} e endividamento de ${formatPercent(
      endividamento,
    )} no período ${period}, com margem líquida de ${formatPercent(margem)}.`,
  )
  narrative.push(
    tendenciaLucro >= 0
      ? `O lucro líquido cresceu ${formatBRL(tendenciaLucro, 1)}% frente a ${PREVIOUS_PERIOD}, reforçando a capacidade de pagamento.`
      : `O lucro líquido recuou ${formatBRL(Math.abs(tendenciaLucro), 1)}% frente a ${PREVIOUS_PERIOD}, o que exige atenção na análise.`,
  )
  if (requestedValue > 0) {
    narrative.push(
      coverage >= 1
        ? `O valor solicitado de R$ ${formatBRL(requestedValue, 2)} está dentro do limite sugerido de R$ ${formatBRL(
            limit,
            2,
          )} (cobertura de ${formatBRL(coverage, 2)}×).`
        : `O valor solicitado de R$ ${formatBRL(requestedValue, 2)} supera o limite sugerido de R$ ${formatBRL(
            limit,
            2,
          )}, com cobertura de apenas ${formatBRL(coverage, 2)}×. Recomenda-se reduzir a exposição ou reforçar garantias.`,
    )
  } else {
    narrative.push(`Informe o valor da solicitação para avaliar a cobertura frente ao limite sugerido.`)
  }

  return {
    requestedValue,
    suggestedLimit: limit,
    coverage,
    score,
    rating,
    ratingLabel: RATING_LABEL[rating],
    headline,
    criteria,
    narrative,
  }
}
