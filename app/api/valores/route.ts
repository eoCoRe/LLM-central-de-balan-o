import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Lança (ou apaga, se valor:null) o valor de uma conta num exercício —
// equivalente a `store.updateAccountValue` / `store.updateDreValue`.
export async function PUT(request: Request) {
  const body = await request.json()
  const { contaId, exercicioId, valor } = body as { contaId: number; exercicioId: number; valor: number | null }

  if (typeof contaId !== "number" || typeof exercicioId !== "number") {
    return NextResponse.json({ error: "contaId e exercicioId são obrigatórios." }, { status: 400 })
  }

  if (valor === null || valor === undefined) {
    await prisma.valor.deleteMany({ where: { contaId, exercicioId } })
    return NextResponse.json({ ok: true })
  }

  const registro = await prisma.valor.upsert({
    where: { exercicioId_contaId: { exercicioId, contaId } },
    update: { valor },
    create: { exercicioId, contaId, valor },
  })
  return NextResponse.json(registro)
}
