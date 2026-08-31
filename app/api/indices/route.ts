import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Catálogo de índices (nome/fórmula/unidade) — o cálculo em si continua em
// lib/financial-data.ts (INDICATORS), lido a partir das contas/valores.
export async function GET() {
  const indices = await prisma.indice.findMany({ orderBy: { id: "asc" } })
  return NextResponse.json({ indices })
}
