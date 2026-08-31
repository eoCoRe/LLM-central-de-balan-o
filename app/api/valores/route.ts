import { NextResponse } from "next/server"
import { upsertOrDeleteValor } from "@/lib/server/valores"

// Lança (ou apaga, se valor:null) o valor de uma conta num exercício —
// equivalente a `store.updateAccountValue` / `store.updateDreValue`. Funciona
// para qualquer tipo de conta (BP, DRE ou DFC), já que Valor é genérico.
export async function PUT(request: Request) {
  const body = await request.json()
  const { contaId, exercicioId, valor } = body as { contaId: number; exercicioId: number; valor: number | null }

  if (typeof contaId !== "number" || typeof exercicioId !== "number") {
    return NextResponse.json({ error: "contaId e exercicioId são obrigatórios." }, { status: 400 })
  }

  const registro = await upsertOrDeleteValor(contaId, exercicioId, valor)
  if (registro === null) return NextResponse.json({ ok: true })
  return NextResponse.json(registro)
}
