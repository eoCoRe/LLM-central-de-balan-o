import { beforeEach, describe, expect, it, vi } from "vitest"

const { prisma } = vi.hoisted(() => ({
  prisma: { $queryRaw: vi.fn() },
}))

vi.mock("@/lib/db", () => ({ prisma }))

import { GET } from "./route"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/health", () => {
  it("reporta ok quando o banco responde", async () => {
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }])
    const response = await GET()
    const body = await response.json()
    expect(body.status).toBe("ok")
    expect(body.database).toBe("ok")
  })

  it("reporta degraded sem derrubar a rota quando o banco está fora do ar", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("connection refused"))
    const response = await GET()
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.database).toBe("unreachable")
  })
})
