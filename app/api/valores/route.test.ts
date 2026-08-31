import { beforeEach, describe, expect, it, vi } from "vitest"

const { prisma } = vi.hoisted(() => ({
  prisma: {
    valor: { upsert: vi.fn(), deleteMany: vi.fn() },
    empresa: { findFirst: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

vi.mock("@/lib/db", () => ({ prisma }))

import { PUT } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
  prisma.empresa.findFirst.mockResolvedValue({ id: 1 })
})

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/valores", { method: "PUT", body: JSON.stringify(body) })
}

describe("PUT /api/valores", () => {
  it("rejeita quando contaId ou exercicioId estão ausentes ou inválidos", async () => {
    const response = await PUT(buildRequest({ valor: 100 }))
    expect(response.status).toBe(400)
    expect(prisma.valor.upsert).not.toHaveBeenCalled()
  })

  it("rejeita valor fora do limite defensivo ou de tipo errado", async () => {
    // Infinity/NaN não sobrevivem a JSON.stringify (viram null), então o caso real de
    // payload malicioso é: número absurdamente grande, ou um tipo que não é number.
    const tooLarge = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: 1e13 }))
    expect(tooLarge.status).toBe(400)

    const wrongType = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: "1234" }))
    expect(wrongType.status).toBe(400)

    expect(prisma.valor.upsert).not.toHaveBeenCalled()
  })

  it("faz upsert quando um valor válido é informado, e registra auditoria", async () => {
    prisma.valor.upsert.mockResolvedValue({ id: 1, contaId: 5, exercicioId: 2, valor: 1234 })

    const response = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: 1234 }))
    const body = await response.json()

    expect(prisma.valor.upsert).toHaveBeenCalledWith({
      where: { exercicioId_contaId: { exercicioId: 2, contaId: 5 } },
      update: { valor: 1234 },
      create: { exercicioId: 2, contaId: 5, valor: 1234 },
    })
    expect(body.valor).toBe(1234)
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ empresaId: 1, acao: "Valor lançado" }) }),
    )
  })

  it("apaga o lançamento quando valor é null, sem chamar upsert", async () => {
    const response = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: null }))
    const body = await response.json()

    expect(prisma.valor.deleteMany).toHaveBeenCalledWith({ where: { contaId: 5, exercicioId: 2 } })
    expect(prisma.valor.upsert).not.toHaveBeenCalled()
    expect(body).toEqual({ ok: true })
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: "Valor removido" }) }),
    )
  })
})
