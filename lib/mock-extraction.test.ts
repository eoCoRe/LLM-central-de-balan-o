import { describe, expect, it } from "vitest"
import type { Account } from "./financial-data"
import { generateMockExtraction } from "./mock-extraction"

function buildAccounts(): Account[] {
  return [
    {
      code: "1",
      name: "Ativo",
      children: [
        { code: "1.1.1", name: "Disponibilidades", values: { "1T2026": 1000 } },
        { code: "1.1.2", name: "Aplicações Financeiras", values: { "1T2026": 2000 } },
      ],
    },
  ]
}

describe("generateMockExtraction", () => {
  it("é determinístico: mesma entrada produz a mesma saída", () => {
    const accounts = buildAccounts()
    const a = generateMockExtraction(accounts, "1T2026")
    const b = generateMockExtraction(accounts, "1T2026")
    expect(a).toEqual(b)
  })

  it("inclui uma linha não reconhecida (conta nula), para exercitar o mapeamento manual", () => {
    const rows = generateMockExtraction(buildAccounts(), "1T2026")
    const unmatched = rows.filter((r) => r.code === null)
    expect(unmatched).toHaveLength(1)
  })

  it("gera uma linha por conta folha (até o limite de 6) mais a linha não reconhecida", () => {
    const rows = generateMockExtraction(buildAccounts(), "1T2026")
    expect(rows).toHaveLength(3) // 2 folhas do fixture + 1 não reconhecida
    expect(rows.filter((r) => r.code !== null).map((r) => r.code)).toEqual(["1.1.1", "1.1.2"])
  })

  it("usa um placeholder plausível quando não há valor base para o exercício", () => {
    const rows = generateMockExtraction(buildAccounts(), undefined)
    for (const row of rows) {
      expect(row.value).toBeGreaterThan(0)
      expect(row.confidence).toBeGreaterThan(0)
      expect(row.confidence).toBeLessThanOrEqual(100)
    }
  })
})
