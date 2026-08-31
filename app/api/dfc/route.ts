import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// DFC é somente leitura e fora do escopo funcional do RFC (ver a nota em
// lib/financial-data.ts sobre createSeedDfc) — todas as linhas, inclusive
// subtotais, já têm valor fixo lançado no seed; nada é calculado aqui.
export async function GET() {
  const contas = await prisma.conta.findMany({
    where: { tipo: "DFC" },
    include: { valores: { include: { exercicio: true } } },
    orderBy: { id: "asc" },
  })

  const linhas = contas.map((conta) => {
    const valores: Record<string, number> = {}
    for (const v of conta.valores) valores[v.exercicio.periodo] = Number(v.valor)
    return { id: conta.id, codigo: conta.codigo, descricao: conta.descricao, valores }
  })

  return NextResponse.json({ linhas })
}
