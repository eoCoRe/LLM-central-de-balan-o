import { NextResponse } from "next/server"
import { ValidationError } from "./validation"

// Converte ValidationError em 400 com a mensagem já pronta para o cliente; qualquer
// outro erro sobe para o handler de erro padrão do Next.js (500).
export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  throw error
}
