# Segurança e Privacidade

Mapeamento entre o §6 (Segurança e Privacidade) e o RNF02 do RFC do projeto e o que está
de fato implementado em `apps/web`, para servir de referência na documentação do TCC e
ser atualizado conforme o projeto avança. Datas e decisões abaixo refletem o estado em
31/08/2026.

## Dados coletados e base legal (LGPD)

Como descrito no RFC: demonstrações financeiras das empresas-cliente (CNPJ, razão
social, contas e valores contábeis) e metadados da análise. É majoritariamente dado de
pessoa jurídica, mas pode haver dado pessoal (sócios, avalistas, MEI) — nesse caso a
LGPD se aplica integralmente.

- **Base legal**: proteção ao crédito (LGPD art. 7º, X), podendo se apoiar também em
  execução de contrato e legítimo interesse. Finalidade declarada e limitada à análise de
  crédito.
- **Armazenamento**: Postgres (hoje um provedor gerenciado — Neon — que oferece
  criptografia em repouso por padrão na camada de infraestrutura; nada no schema faz
  criptografia de campo adicional).
- **Retenção/descarte**: ainda não implementado (sem rotina de expurgo); é trabalho
  futuro listado abaixo.
- **Direitos do titular** (confirmação, acesso, correção, eliminação): hoje dependem de
  intervenção manual no banco — não há um fluxo de autoatendimento. Trabalho futuro.

## O que está implementado

| Controle (RFC) | Status | Onde |
|---|---|---|
| Validação de upload (tipo/tamanho) | ✅ | `lib/upload-validation.ts` — rejeita arquivo vazio, >20 MB, ou fora de PDF/PNG/JPG, com mensagem clara (cobre o fluxo alternativo "Formato não suportado" do §3.2) |
| Segredos fora do código | ✅ | `DATABASE_URL` e futura `LLM_API_KEY` só em `.env` (gitignored); `.env.example` documenta o formato sem valores reais |
| Proteção contra SQL injection | ✅ | Todo acesso a dado passa pelo Prisma Client (queries parametrizadas); nenhuma rota usa `$queryRawUnsafe` ou concatenação de SQL |
| Validação de entrada nas rotas de API | ✅ | `lib/server/validation.ts` — tipo, tamanho de string, faixa numérica e limite de itens em `/api/plano-de-contas`, `/api/valores` e `/api/extracoes`; erro de validação vira HTTP 400 com mensagem, nunca um 500 cru |
| Trilha de auditoria (RNF03) | ✅ (parcial) | `AuditLog` no schema + `lib/server/audit.ts`, chamado por toda rota que muta dado (criar conta, lançar/remover valor, confirmar extração); `GET /api/auditoria` expõe o histórico |
| Rastreabilidade da extração (RF06) | ✅ (estrutura pronta) | `ValorExtraido.paginaOrigem` / `.confianca` no schema; a tela de revisão já mostra e usa esses campos — falta a extração real alimentá-los com dados de um LLM de verdade |

## O que ainda não está implementado (e por quê)

| Controle (RFC) | Status | Motivo |
|---|---|---|
| Autenticação e autorização por perfil (analista/coordenador/administrador) | ❌ | Decisão explícita do usuário: login fica para uma fase posterior. Efeito colateral conhecido: `AuditLog.usuario` fica fixo em `"Sistema"` (backend) ou o nome hardcoded do usuário de demonstração (frontend) em vez do usuário autenticado real |
| Controle de acesso a nível de objeto ("analista não vê dados fora do seu escopo") | ❌ | Depende de autenticação (acima); hoje o sistema é single-tenant/single-usuário por design de protótipo |
| Anonimização/redação (CNPJ, razão social) antes do envio a LLM externo | ❌ | Não há envio a LLM real ainda — a extração é mock (`lib/mock-extraction.ts`). Vira obrigatório no momento em que RF02 passar a chamar uma API de LLM de verdade |
| DPA / contrato de retenção zero com provedor de LLM | ❌ | Depende de qual provedor for escolhido quando a extração real for implementada — decisão de negócio, não de código |
| Criptografia de campo para dado sensível em repouso | ❌ | Hoje depende só da criptografia em repouso do provedor gerenciado de Postgres; não há criptografia adicional a nível de coluna |
| HTTPS/TLS obrigatório | N/A neste estágio | Responsabilidade da camada de hospedagem (Vercel ou similar) no deploy, não do código da aplicação em si |
| Rotina de retenção/expurgo de dados | ❌ | Não definida ainda; depende de política de retenção que o negócio precisa fixar |
| Prevenção a prompt injection embutida no PDF | ❌ | Só é um risco real quando existir uma chamada de LLM de verdade recebendo texto extraído do documento; hoje não há prompt nenhum sendo montado |

## Nota sobre o stack de LLM

O RFC (§5.4/§5.5) especifica consumo de uma **API de LLM externa** (não um modelo
próprio self-hosted) com saída estruturada, DPA de retenção zero e anonimização antes do
envio. Isso diverge do que consta em `diagramas_modelo_proprio.md` (que descreve um
modelo fine-tuned self-hosted) — os dois documentos do repositório não estão alinhados
entre si; até essa divergência ser resolvida, os itens de segurança específicos de "envio a
LLM externo" acima seguem a versão do RFC.
