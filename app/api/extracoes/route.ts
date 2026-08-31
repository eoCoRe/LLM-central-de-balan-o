import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getDefaultEmpresa } from "@/lib/server/empresa"
import { upsertOrDeleteValor } from "@/lib/server/valores"

interface ExtracaoItemInput {
  contaId: number | null
  valor: number
  confianca: number
  paginaOrigem?: number
}

// Registra o resultado de uma extração (Extração via IA) já revisada e
// confirmada pelo analista: grava a Extracao + um ValorExtraido por item
// (rastreabilidade, inclusive dos não mapeados), e só os itens com conta
// mapeada viram Valor de verdade — equivalente a store.confirmExtraction.
export async function POST(request: Request) {
  const body = await request.json()
  const { exercicioId, arquivoOrigem, modeloLlm, itens } = body as {
    exercicioId: number
    arquivoOrigem: string
    modeloLlm?: string
    itens: ExtracaoItemInput[]
  }

  if (!exercicioId || !arquivoOrigem || !Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json({ error: "exercicioId, arquivoOrigem e itens são obrigatórios." }, { status: 400 })
  }

  const extracao = await prisma.extracao.create({
    data: {
      exercicioId,
      arquivoOrigem,
      modeloLlm: modeloLlm || "mock-demo-v1",
      status: "CONCLUIDA",
    },
  })

  await prisma.valorExtraido.createMany({
    data: itens.map((item) => ({
      extracaoId: extracao.id,
      contaId: item.contaId,
      valor: item.valor,
      paginaOrigem: item.paginaOrigem,
      confianca: item.confianca,
    })),
  })

  let gravados = 0
  for (const item of itens) {
    if (item.contaId === null) continue
    await upsertOrDeleteValor(item.contaId, exercicioId, item.valor)
    gravados++
  }

  const empresa = await getDefaultEmpresa()
  await prisma.auditLog.create({
    data: {
      empresaId: empresa.id,
      usuario: "Sistema",
      acao: "Extração confirmada",
      detalhe: `${gravados} conta(s) de "${arquivoOrigem}" gravada(s) (revisão humana concluída).`,
    },
  })

  return NextResponse.json({ extracaoId: extracao.id, gravados }, { status: 201 })
}

export async function GET() {
  const extracoes = await prisma.extracao.findMany({
    orderBy: { criadoEm: "desc" },
    take: 20,
    include: { _count: { select: { valoresExtraidos: true } }, exercicio: true },
  })

  return NextResponse.json({
    extracoes: extracoes.map((e) => ({
      id: e.id,
      arquivoOrigem: e.arquivoOrigem,
      modeloLlm: e.modeloLlm,
      status: e.status,
      criadoEm: e.criadoEm,
      exercicio: e.exercicio.periodo,
      totalItens: e._count.valoresExtraidos,
    })),
  })
}
