# Central de Balanços

Frontend da Central de Balanços: cadastro do Plano de Contas, tabulação do
Balanço/DRE por exercício, demonstrações consolidadas, índices financeiros
calculados automaticamente, parecer de crédito (Opinião de Venda) e a tela de
revisão da extração por IA (Extração IA) — onde o analista confere os valores
que o LLM extraiu de um Balanço/DRE em PDF antes de confirmá-los para a
Tabulação (fluxo *human-in-the-loop*).

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4
- Estado da aplicação em memória + `localStorage`, sem backend (dados de
  demonstração seedados em `lib/financial-data.ts`)

## Estrutura

```
app/                       # rotas do App Router (layout, página)
components/
├── screens/                # telas: dashboard, plano-de-contas, tabulacao,
│                            #   demonstracoes, indices, opiniao-de-venda,
│                            #   extracao-ia
└── ui/                     # componentes genéricos (botão, etc.)
lib/
├── financial-data.ts       # modelo de dados e motor de cálculo (puro, sem estado)
├── store.tsx               # FinancialDataProvider / useFinancialStore (estado global)
├── navigation.ts
└── utils.ts
```

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Acesse `http://localhost:3000`.
