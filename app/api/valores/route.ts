import { NextResponse } from "next/server"
import { getDefaultEmpresa } from "@/lib/server/empresa"
import { logAudit } from "@/lib/server/audit"
import { handleRouteError } from "@/lib/server/http"
import { requireBoundedNumber, requirePositiveInt } from "@/lib/server/validation"
import { upsertOrDeleteValor } from "@/lib/server/valores"

// Lança (ou apaga, se valor:null) o valor de uma conta num exercício —
// equivalente a `store.updateAccountValue` / `store.updateDreValue`. Funciona
// para qualquer tipo de conta (BP, DRE ou DFC), já que Valor é genérico.
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { contaId: rawContaId, exercicioId: rawExercicioId, valor: rawValor } = body as {
      contaId: number
      exercicioId: number
      valor: number | null
    }

    const contaId = requirePositiveInt(rawContaId, "contaId")
    const exercicioId = requirePositiveInt(rawExercicioId, "exercicioId")
    const valor = rawValor === null || rawValor === undefined ? null : requireBoundedNumber(rawValor, "valor")

    const registro = await upsertOrDeleteValor(contaId, exercicioId, valor)

    const empresa = await getDefaultEmpresa()
    await logAudit(
      empresa.id,
      valor === null ? "Valor removido" : "Valor lançado",
      valor === null ? `conta ${contaId} · exercício ${exercicioId} limpo.` : `conta ${contaId} · exercício ${exercicioId} = ${valor}`,
    )

    if (registro === null) return NextResponse.json({ ok: true })
    return NextResponse.json(registro)
  } catch (error) {
    return handleRouteError(error)
  }
}
