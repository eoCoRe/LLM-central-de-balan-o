import { beforeEach, describe, expect, it, vi } from "vitest"

const { prisma } = vi.hoisted(() => ({
  prisma: {
    empresa: { findFirst: vi.fn() },
    auditLog: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/db", () => ({ prisma }))

import { GET } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/auditoria", () => {
  it("lista os logs da empresa, mais recentes primeiro", async () => {
    prisma.empresa.findFirst.mockResolvedValue({ id: 1 })
    prisma.auditLog.findMany.mockResolvedValue([
      { id: 2, empresaId: 1, usuario: "Renata Alves", acao: "Valor lançado", detalhe: "1.1.1 · 1T2026 = 945" },
    ])

    const response = await GET()
    const body = await response.json()

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { empresaId: 1 }, orderBy: { criadoEm: "desc" } }),
    )
    expect(body.logs).toHaveLength(1)
  })
})
