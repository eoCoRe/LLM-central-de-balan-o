import { prisma } from "@/lib/db"

// RNF03 (Auditabilidade) — mesmo padrão de mensagem do store.tsx do frontend, agora
// persistido. `usuario` fica fixo em "Sistema" até existir autenticação real (RNF02) —
// documentado em SECURITY.md como limitação conhecida desta fase.
export async function logAudit(empresaId: number, acao: string, detalhe: string, usuario = "Sistema") {
  return prisma.auditLog.create({ data: { empresaId, usuario, acao, detalhe } })
}
