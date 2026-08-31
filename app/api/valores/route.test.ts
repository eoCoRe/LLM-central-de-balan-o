import { beforeEach, describe, expect, it, vi } from "vitest"

const { prisma } = vi.hoisted(() => ({
  prisma: {
    valor: { upsert: vi.fn(), deleteMany: vi.fn() },
  },
}))

vi.mock("@/lib/db", () => ({ prisma }))

import { PUT } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
})

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/valores", { method: "PUT", body: JSON.stringify(body) })
}

describe("PUT /api/valores", () => {
  it("rejeita quando contaId ou exercicioId estão ausentes", async () => {
    const response = await PUT(buildRequest({ valor: 100 }))
    expect(response.status).toBe(400)
    expect(prisma.valor.upsert).not.toHaveBeenCalled()
  })

  it("faz upsert quando um valor é informado", async () => {
    prisma.valor.upsert.mockResolvedValue({ id: 1, contaId: 5, exercicioId: 2, valor: 1234 })

    const response = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: 1234 }))
    const body = await response.json()

    expect(prisma.valor.upsert).toHaveBeenCalledWith({
      where: { exercicioId_contaId: { exercicioId: 2, contaId: 5 } },
      update: { valor: 1234 },
      create: { exercicioId: 2, contaId: 5, valor: 1234 },
    })
    expect(body.valor).toBe(1234)
  })

  it("apaga o lançamento quando valor é null, sem chamar upsert", async () => {
    const response = await PUT(buildRequest({ contaId: 5, exercicioId: 2, valor: null }))
    const body = await response.json()

    expect(prisma.valor.deleteMany).toHaveBeenCalledWith({ where: { contaId: 5, exercicioId: 2 } })
    expect(prisma.valor.upsert).not.toHaveBeenCalled()
    expect(body).toEqual({ ok: true })
  })
})
