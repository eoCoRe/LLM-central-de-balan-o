import { beforeEach, describe, expect, it, vi } from "vitest"

const { prisma } = vi.hoisted(() => ({
  prisma: {
    empresa: { findFirst: vi.fn() },
    exercicio: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/db", () => ({ prisma }))

import { GET } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/empresa", () => {
  it("retorna a empresa e seus exercícios", async () => {
    prisma.empresa.findFirst.mockResolvedValue({
      id: 1,
      cnpj: "12.345.678/0001-90",
      razaoSocial: "Farmácia Bem-Estar Ltda",
      setor: "Comércio Varejista",
    })
    prisma.exercicio.findMany.mockResolvedValue([
      { id: 1, periodo: "4T2024", auditado: false },
      { id: 2, periodo: "1T2025", auditado: false },
    ])

    const response = await GET()
    const body = await response.json()

    expect(body.razaoSocial).toBe("Farmácia Bem-Estar Ltda")
    expect(body.exercicios).toHaveLength(2)
    expect(body.exercicios[0]).toEqual({ id: 1, periodo: "4T2024", auditado: false })
  })

  it("propaga o erro quando não há empresa cadastrada (banco não seedado)", async () => {
    prisma.empresa.findFirst.mockResolvedValue(null)
    await expect(GET()).rejects.toThrow(/Nenhuma empresa cadastrada/)
  })
})
