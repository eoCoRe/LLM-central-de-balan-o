// Referências de mercado por setor, usadas para comparar os índices da empresa
// analisada contra a média do setor. Valores ilustrativos (ordem de grandeza
// típica encontrada em análises de crédito no mercado brasileiro) — devem ser
// ajustados por quem cadastra a análise conforme a fonte setorial disponível.

export interface Sector {
  id: string
  label: string
}

export const SECTORS: Sector[] = [
  { id: "comercio-varejista", label: "Comércio Varejista" },
  { id: "industria", label: "Indústria de Transformação" },
  { id: "servicos", label: "Serviços" },
  { id: "construcao-civil", label: "Construção Civil" },
  { id: "agronegocio", label: "Agronegócio" },
]

export const DEFAULT_SECTOR_ID = SECTORS[0].id

export const SECTOR_BENCHMARKS: Record<string, Partial<Record<string, number>>> = {
  "comercio-varejista": {
    "liquidez-corrente": 1.4,
    "liquidez-seca": 0.8,
    "liquidez-geral": 1.1,
    "liquidez-imediata": 0.25,
    "endividamento-geral": 55,
    "composicao-endividamento": 70,
    "imobilizacao-pl": 60,
    "margem-bruta": 32,
    "margem-liquida": 4,
    roe: 12,
    roa: 5,
    "giro-ativo": 1.6,
    pmre: 55,
    pmrv: 30,
    pmpc: 40,
  },
  industria: {
    "liquidez-corrente": 1.6,
    "liquidez-seca": 1.0,
    "liquidez-geral": 1.2,
    "liquidez-imediata": 0.2,
    "endividamento-geral": 50,
    "composicao-endividamento": 55,
    "imobilizacao-pl": 90,
    "margem-bruta": 28,
    "margem-liquida": 6,
    roe: 14,
    roa: 6,
    "giro-ativo": 0.9,
    pmre: 70,
    pmrv: 50,
    pmpc: 45,
  },
  servicos: {
    "liquidez-corrente": 1.8,
    "liquidez-seca": 1.5,
    "liquidez-geral": 1.4,
    "liquidez-imediata": 0.4,
    "endividamento-geral": 40,
    "composicao-endividamento": 65,
    "imobilizacao-pl": 50,
    "margem-bruta": 45,
    "margem-liquida": 8,
    roe: 16,
    roa: 7,
    "giro-ativo": 1.1,
    pmre: 10,
    pmrv: 35,
    pmpc: 30,
  },
  "construcao-civil": {
    "liquidez-corrente": 1.3,
    "liquidez-seca": 0.7,
    "liquidez-geral": 1.0,
    "liquidez-imediata": 0.15,
    "endividamento-geral": 65,
    "composicao-endividamento": 45,
    "imobilizacao-pl": 40,
    "margem-bruta": 25,
    "margem-liquida": 5,
    roe: 10,
    roa: 3,
    "giro-ativo": 0.5,
    pmre: 180,
    pmrv: 60,
    pmpc: 60,
  },
  agronegocio: {
    "liquidez-corrente": 1.5,
    "liquidez-seca": 0.9,
    "liquidez-geral": 1.2,
    "liquidez-imediata": 0.2,
    "endividamento-geral": 48,
    "composicao-endividamento": 50,
    "imobilizacao-pl": 100,
    "margem-bruta": 22,
    "margem-liquida": 7,
    roe: 13,
    roa: 5,
    "giro-ativo": 0.7,
    pmre: 90,
    pmrv: 45,
    pmpc: 50,
  },
}

export function sectorBenchmarkFor(sectorId: string, indicatorId: string): number | undefined {
  return SECTOR_BENCHMARKS[sectorId]?.[indicatorId]
}

export function sectorLabel(sectorId: string): string {
  return SECTORS.find((s) => s.id === sectorId)?.label ?? sectorId
}
