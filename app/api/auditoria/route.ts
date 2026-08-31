import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getDefaultEmpresa } from "@/lib/server/empresa"

// Trilha de auditoria (RF08) — equivalente a `store.auditLog`, agora persistida.
export async function GET() {
  const empresa = await getDefaultEmpresa()
  const logs = await prisma.auditLog.findMany({
    where: { empresaId: empresa.id },
    orderBy: { criadoEm: "desc" },
    take: 50,
  })
  return NextResponse.json({ logs })
}
