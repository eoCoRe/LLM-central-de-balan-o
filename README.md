# Central de Balanços — Módulo de Revisão da Extração

Frontend do módulo de IA da Central de Balanços: a tela onde o analista de
crédito revisa os valores que o LLM extraiu de um Balanço/DRE em PDF — com
score de confiança e página de origem — antes de confirmá-los e enviá-los
para a Tabulação (fluxo *human-in-the-loop*).

## Stack

- [Vite](https://vite.dev/)
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4

## Estrutura

```
src/
├── types/extraction.ts          # tipos do domínio (conta, valor, confiança, origem)
├── utils/
│   ├── confidence.ts            # regra de negócio do limiar de revisão humana
│   └── formatCurrency.ts        # formatação de valores em milhares (pt-BR)
├── data/mockExtractionData.ts   # dados mockados de uma extração
├── components/
│   ├── ui/                      # componentes genéricos (botão, badge de confiança)
│   ├── layout/                  # Header, Sidebar, DashboardLayout
│   └── extraction/               # componentes da tela de Revisão da Extração
└── pages/ExtractionReviewPage.tsx
```

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.
