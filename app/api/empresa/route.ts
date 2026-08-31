import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getDefaultEmpresa } from "@/lib/server/empresa"

export async function GET() {
  const empresa = await getDefaultEmpresa()
  const exercicios = await prisma.exercicio.findMany({
    where: { empresaId: empresa.id },
    orderBy: { id: "asc" },
  })

  return NextResponse.json({
    id: empresa.id,
    cnpj: empresa.cnpj,
    razaoSocial: empresa.razaoSocial,
    setor: empresa.setor,
    exercicios: exercicios.map((e) => ({ id: e.id, periodo: e.periodo, auditado: e.auditado })),
  })
}
