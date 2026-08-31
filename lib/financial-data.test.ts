import { describe, expect, it } from "vitest"
import {
  accountTotalByName,
  applyScale,
  collectLeaves,
  computeDre,
  deltaPercent,
  findAccountByCode,
  findAccountByName,
  flattenAccounts,
  formatBRL,
  formatIndicatorValue,
  formatPercent,
  formatRatio,
  formatScaled,
  indicatorStatus,
  INDICATORS,
  makeIndicatorContext,
  sumAccount,
  type Account,
  type DreValues,
} from "./financial-data"

// Árvore mínima só para os testes — não depende dos dados de exemplo do app,
// então continua válida se o Plano de Contas de demonstração mudar.
function buildFixtureAccounts(): Account[] {
  return [
    {
      code: "1",
      name: "Ativo",
      children: [
        {
          code: "1.1",
          name: "Ativo Circulante",
          children: [
            { code: "1.1.1", name: "Disponibilidades", values: { P1: 100, P2: 120 } },
            { code: "1.1.2", name: "Estoques", values: { P1: 200 } }, // sem valor em P2
          ],
        },
      ],
    },
    {
      code: "2",
      name: "Passivo Circulante",
      values: { P1: 250, P2: 300 },
    },
  ]
}

describe("sumAccount", () => {
  it("retorna o valor direto de uma conta folha", () => {
    const [ativo] = buildFixtureAccounts()
    expect(sumAccount(ativo.children![0].children![0], "P1")).toBe(100)
  })

  it("soma os filhos quando todos têm valor no período", () => {
    const [ativo] = buildFixtureAccounts()
    expect(sumAccount(ativo.children![0], "P1")).toBe(300) // 100 + 200
  })

  it("propaga undefined (dados insuficientes) se um filho não tem valor no período", () => {
    const [ativo] = buildFixtureAccounts()
    // Estoques não tem valor em P2 -> grupo inteiro fica indefinido, não "0"
    expect(sumAccount(ativo.children![0], "P2")).toBeUndefined()
  })

  it("retorna undefined para uma folha sem valor no período pedido", () => {
    const [ativo] = buildFixtureAccounts()
    expect(sumAccount(ativo.children![0].children![1], "P2")).toBeUndefined()
  })
})

describe("findAccountByName / findAccountByCode / accountTotalByName", () => {
  const accounts = buildFixtureAccounts()

  it("encontra uma conta pelo nome em qualquer nível da árvore", () => {
    expect(findAccountByName(accounts, "Disponibilidades")?.code).toBe("1.1.1")
  })

  it("encontra uma conta pelo código", () => {
    expect(findAccountByCode(accounts, "1.1")?.name).toBe("Ativo Circulante")
  })

  it("retorna undefined para conta inexistente", () => {
    expect(findAccountByName(accounts, "Não existe")).toBeUndefined()
    expect(accountTotalByName(accounts, "Não existe", "P1")).toBeUndefined()
  })

  it("soma pelo nome, propagando dados insuficientes", () => {
    expect(accountTotalByName(accounts, "Ativo Circulante", "P1")).toBe(300)
    expect(accountTotalByName(accounts, "Ativo Circulante", "P2")).toBeUndefined()
  })
})

describe("collectLeaves / flattenAccounts", () => {
  const accounts = buildFixtureAccounts()

  it("coleta só as contas com valores (folhas)", () => {
    const leaves = collectLeaves(accounts)
    expect(leaves.map((a) => a.code).sort()).toEqual(["1.1.1", "1.1.2", "2"])
  })

  it("achata preservando a profundidade de cada nó", () => {
    const flat = flattenAccounts(accounts)
    const byCode = Object.fromEntries(flat.map((r) => [r.account.code, r.depth]))
    expect(byCode["1"]).toBe(0)
    expect(byCode["1.1"]).toBe(1)
    expect(byCode["1.1.1"]).toBe(2)
    expect(byCode["2"]).toBe(0)
  })
})

describe("computeDre", () => {
  it("encadeia os totalizadores corretamente a partir das entradas", () => {
    const inputs: DreValues = {
      "receita-bruta": 1000,
      deducoes: -100,
      cmv: -400,
      "despesas-operacionais": -200,
      "resultado-financeiro": -50,
      "ir-csll": -60,
    }
    const dre = computeDre(inputs)
    expect(dre["receita-liquida"]).toBe(900) // 1000 - 100
    expect(dre["lucro-bruto"]).toBe(500) // 900 - 400
    expect(dre["ebit"]).toBe(300) // 500 - 200
    expect(dre["resultado-antes-ir"]).toBe(250) // 300 - 50
    expect(dre["lucro-liquido"]).toBe(190) // 250 - 60
  })

  it("propaga undefined (RN04) quando falta algum insumo", () => {
    const dre = computeDre({ "receita-bruta": 1000 }) // sem deduções
    expect(dre["receita-liquida"]).toBeUndefined()
    expect(dre["lucro-bruto"]).toBeUndefined()
    expect(dre["lucro-liquido"]).toBeUndefined()
  })

  it("repassa a linha informativa 'compras' sem alterá-la", () => {
    const dre = computeDre({ compras: 500 })
    expect(dre.compras).toBe(500)
  })
})

describe("applyScale / formatBRL / formatScaled / formatRatio / formatPercent", () => {
  it("converte a escala corretamente (valores em milhares)", () => {
    expect(applyScale(1000, "milhares")).toBe(1000)
    expect(applyScale(1000, "unidade")).toBe(1_000_000)
    expect(applyScale(1000, "milhoes")).toBe(1)
  })

  it("formata em pt-BR (vírgula decimal, separador de milhar)", () => {
    expect(formatBRL(1234.5, 2)).toBe("1.234,50")
    expect(formatBRL(1234, 0)).toBe("1.234")
  })

  it("formatScaled mostra travessão para valor indefinido (dados insuficientes)", () => {
    expect(formatScaled(undefined, "milhares")).toBe("—")
    expect(formatScaled(1000, "milhares")).toBe("1.000")
  })

  it("formatRatio e formatPercent usam as casas decimais esperadas", () => {
    expect(formatRatio(1.5)).toBe("1,50")
    expect(formatPercent(54.678)).toBe("54,7%")
  })
})

describe("formatIndicatorValue", () => {
  const ratioIndicator = INDICATORS.find((i) => i.unit === "ratio")!
  const percentIndicator = INDICATORS.find((i) => i.unit === "percent")!
  const diasIndicator = INDICATORS.find((i) => i.unit === "dias")!

  it("mostra 'Dados insuficientes' para valor indefinido, independente da unidade", () => {
    expect(formatIndicatorValue(ratioIndicator, undefined)).toBe("Dados insuficientes")
  })

  it("formata cada unidade no padrão certo", () => {
    expect(formatIndicatorValue(ratioIndicator, 1.5)).toBe("1,50")
    expect(formatIndicatorValue(percentIndicator, 12.34)).toBe("12,3%")
    expect(formatIndicatorValue(diasIndicator, 45.6)).toBe("46 dias")
  })
})

describe("deltaPercent", () => {
  it("calcula a variação percentual normal", () => {
    expect(deltaPercent(110, 100)).toBeCloseTo(10)
    expect(deltaPercent(90, 100)).toBeCloseTo(-10)
  })

  it("retorna undefined se faltar algum valor ou o anterior for zero", () => {
    expect(deltaPercent(undefined, 100)).toBeUndefined()
    expect(deltaPercent(100, undefined)).toBeUndefined()
    expect(deltaPercent(100, 0)).toBeUndefined()
  })
})

describe("indicatorStatus", () => {
  const higherIsBetter = INDICATORS.find((i) => i.id === "liquidez-corrente")! // thresholds 1.5 / 1.0
  const lowerIsBetter = INDICATORS.find((i) => i.id === "endividamento-geral")! // thresholds 50 / 70

  it("indisponível para valor indefinido, NaN ou infinito", () => {
    expect(indicatorStatus(higherIsBetter, undefined)).toBe("indisponivel")
    expect(indicatorStatus(higherIsBetter, Number.NaN)).toBe("indisponivel")
    expect(indicatorStatus(higherIsBetter, Number.POSITIVE_INFINITY)).toBe("indisponivel")
  })

  it("classifica corretamente quando maior é melhor", () => {
    expect(indicatorStatus(higherIsBetter, 2.0)).toBe("ok")
    expect(indicatorStatus(higherIsBetter, 1.2)).toBe("atencao")
    expect(indicatorStatus(higherIsBetter, 0.5)).toBe("risco")
  })

  it("classifica corretamente quando menor é melhor", () => {
    expect(indicatorStatus(lowerIsBetter, 40)).toBe("ok")
    expect(indicatorStatus(lowerIsBetter, 60)).toBe("atencao")
    expect(indicatorStatus(lowerIsBetter, 90)).toBe("risco")
  })
})

describe("motor de índices (INDICATORS + makeIndicatorContext)", () => {
  it("calcula Liquidez Corrente a partir do Plano de Contas", () => {
    const accounts: Account[] = [
      { code: "1.1", name: "Ativo Circulante", values: { P1: 300 } },
      { code: "2.1", name: "Passivo Circulante", values: { P1: 150 } },
    ]
    const ctx = makeIndicatorContext(accounts, computeDre({}), "P1")
    const liquidezCorrente = INDICATORS.find((i) => i.id === "liquidez-corrente")!
    expect(liquidezCorrente.compute(ctx)).toBe(2)
  })

  it("retorna undefined quando a conta usada na fórmula não existe no período (RN04)", () => {
    const accounts: Account[] = [{ code: "1.1", name: "Ativo Circulante", values: {} }]
    const ctx = makeIndicatorContext(accounts, computeDre({}), "P1")
    const liquidezCorrente = INDICATORS.find((i) => i.id === "liquidez-corrente")!
    expect(liquidezCorrente.compute(ctx)).toBeUndefined()
  })
})
