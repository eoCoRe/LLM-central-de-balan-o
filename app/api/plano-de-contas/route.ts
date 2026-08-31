import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface ContaNode {
  id: number
  codigo: string
  descricao: string
  valores: Record<string, number>
  subcontas?: ContaNode[]
}

// Árvore do Balanço Patrimonial (tipo BP), com os valores lançados por exercício —
// equivalente a `store.accounts` no frontend, só que lido do Postgres.
export async function GET() {
  const contas = await prisma.conta.findMany({
    where: { tipo: "BP" },
    include: { valores: { include: { exercicio: true } } },
    orderBy: { codigo: "asc" },
  })

  const nodeById = new Map<number, ContaNode>()
  for (const conta of contas) {
    const valores: Record<string, number> = {}
    for (const v of conta.valores) valores[v.exercicio.periodo] = Number(v.valor)
    nodeById.set(conta.id, { id: conta.id, codigo: conta.codigo, descricao: conta.descricao, valores })
  }

  const roots: ContaNode[] = []
  for (const conta of contas) {
    const node = nodeById.get(conta.id)!
    if (conta.contaPaiId === null) {
      roots.push(node)
      continue
    }
    const parent = nodeById.get(conta.contaPaiId)
    if (parent) parent.subcontas = [...(parent.subcontas ?? []), node]
  }

  return NextResponse.json({ contas: roots })
}

// Cria uma conta raiz (parentId null) ou subconta — equivalente a
// `store.addAccountNode`, gerando o próximo código na mesma convenção
// (raiz: "1", "2", ...; filha: "<pai>.<n>").
export async function POST(request: Request) {
  const body = await request.json()
  const { parentId, nome } = body as { parentId: number | null; nome: string }

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
  }

  const codigo = await nextCodigo(parentId)
  const conta = await prisma.conta.create({
    data: { codigo, descricao: nome.trim(), tipo: "BP", contaPaiId: parentId },
  })
  return NextResponse.json(conta, { status: 201 })
}

async function nextCodigo(parentId: number | null): Promise<string> {
  if (parentId === null) {
    const roots = await prisma.conta.findMany({ where: { tipo: "BP", contaPaiId: null } })
    const used = new Set(roots.map((r) => r.codigo))
    let n = 1
    while (used.has(String(n))) n++
    return String(n)
  }

  const parent = await prisma.conta.findUniqueOrThrow({ where: { id: parentId } })
  const siblings = await prisma.conta.findMany({ where: { contaPaiId: parentId } })
  const used = new Set(siblings.map((s) => s.codigo))
  let n = 1
  while (used.has(`${parent.codigo}.${n}`)) n++
  return `${parent.codigo}.${n}`
}
