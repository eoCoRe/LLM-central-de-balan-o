import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Observabilidade mínima (núcleo comum de engenharia do Portfolio Directions):
// um endpoint simples para health-check externo (uptime monitor, load balancer,
// ou uma integração futura com Grafana/Datadog/etc.) verificar se a aplicação e
// o banco estão de pé. Não substitui métricas/tracing de verdade — é o ponto
// de partida documentado em SECURITY.md/README.
export async function GET() {
  const startedAt = Date.now()
  let database: "ok" | "unreachable" = "unreachable"

  try {
    await prisma.$queryRaw`SELECT 1`
    database = "ok"
  } catch {
    // Sem DATABASE_URL configurada ou banco fora do ar — reportamos, não derrubamos a rota.
  }

  return NextResponse.json({
    status: database === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checkDurationMs: Date.now() - startedAt,
    database,
  })
}
