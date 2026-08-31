"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  COMPANY,
  createSeedAccounts,
  createSeedDfc,
  createSeedDre,
  SEED_EXERCICIOS,
  type Account,
  type DreValues,
  type StaticLine,
} from "./financial-data"
import { DEFAULT_SECTOR_ID } from "./sector-benchmarks"

export interface Exercicio {
  id: string
  label: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  detail: string
}

interface StoreData {
  companyName: string
  sectorId: string
  exercicios: Exercicio[]
  accounts: Account[]
  dreByExercicio: Record<string, DreValues>
  dfc: StaticLine[]
  auditLog: AuditEntry[]
  currentUser: string
}

const STORAGE_KEY = "central-de-balancos:v1"
const STORAGE_VERSION = 1

function seedData(): StoreData {
  return {
    companyName: COMPANY.name,
    sectorId: DEFAULT_SECTOR_ID,
    exercicios: SEED_EXERCICIOS.map((id) => ({ id, label: id })),
    accounts: createSeedAccounts(),
    dreByExercicio: createSeedDre(),
    dfc: createSeedDfc(),
    auditLog: [
      {
        id: "seed",
        timestamp: new Date().toISOString(),
        user: "Sistema",
        action: "Dados de exemplo carregados",
        detail: `${SEED_EXERCICIOS.length} exercícios de demonstração (${SEED_EXERCICIOS.join(", ")}).`,
      },
    ],
    currentUser: "Renata Alves",
  }
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

function nextRootCode(accounts: Account[]): string {
  const used = new Set(accounts.map((a) => a.code))
  let n = 1
  while (used.has(String(n))) n++
  return String(n)
}

function nextChildCode(parent: Account): string {
  const used = new Set((parent.children ?? []).map((c) => c.code))
  let n = 1
  while (used.has(`${parent.code}.${n}`)) n++
  return `${parent.code}.${n}`
}

function mapAccountTree(accounts: Account[], code: string, fn: (a: Account) => Account | null): Account[] {
  const out: Account[] = []
  for (const account of accounts) {
    if (account.code === code) {
      const result = fn(account)
      if (result) out.push(result)
      continue
    }
    if (account.children) {
      out.push({ ...account, children: mapAccountTree(account.children, code, fn) })
    } else {
      out.push(account)
    }
  }
  return out
}

interface StoreApi extends StoreData {
  hydrated: boolean
  setCurrentUser: (name: string) => void
  setSector: (sectorId: string) => void
  addExercicio: (label: string) => string
  updateAccountValue: (code: string, exercicioId: string, value: number | undefined) => void
  updateDreValue: (exercicioId: string, lineId: string, value: number | undefined) => void
  addAccountNode: (parentCode: string | null, name: string, isGroup: boolean) => void
  renameAccountNode: (code: string, name: string) => void
  deleteAccountNode: (code: string) => void
  confirmExtraction: (exercicioId: string, entries: { code: string; value: number }[], fileName: string) => void
  resetToSeed: () => void
}

const StoreContext = createContext<StoreApi | undefined>(undefined)

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(seedData)
  const [hydrated, setHydrated] = useState(false)
  const skipNextSave = useRef(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.version === STORAGE_VERSION && parsed.data) {
          // Mescla com os dados de exemplo para preencher campos adicionados depois que
          // este registro foi salvo (ex: sectorId), sem precisar invalidar o storage inteiro.
          // One-time hydration from localStorage on mount; can't read it during the lazy
          // useState initializer because it must return the same value on server and client
          // to avoid a hydration mismatch.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setData({ ...seedData(), ...parsed.data })
        }
      }
    } catch {
      // localStorage indisponível ou dado corrompido — segue com os dados de exemplo.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data }))
    } catch {
      // quota excedida ou navegação privada — falha silenciosamente, não é crítico.
    }
  }, [data, hydrated])

  const audit = useCallback((prev: StoreData, action: string, detail: string): AuditEntry[] => {
    const entry: AuditEntry = {
      id: uid(),
      timestamp: new Date().toISOString(),
      user: prev.currentUser,
      action,
      detail,
    }
    return [entry, ...prev.auditLog].slice(0, 300)
  }, [])

  const setCurrentUser = useCallback((name: string) => {
    setData((prev) => ({ ...prev, currentUser: name || prev.currentUser }))
  }, [])

  const setSector = useCallback((sectorId: string) => {
    setData((prev) => ({
      ...prev,
      sectorId,
      auditLog: audit(prev, "Setor alterado", `Benchmark setorial ajustado para "${sectorId}".`),
    }))
  }, [audit])

  const addExercicio = useCallback((label: string) => {
    const id = `${slugify(label)}-${uid().slice(0, 4)}`
    setData((prev) => ({
      ...prev,
      exercicios: [...prev.exercicios, { id, label }],
      auditLog: audit(prev, "Exercício criado", `Novo exercício "${label}" aberto para tabulação.`),
    }))
    return id
  }, [audit])

  const updateAccountValue = useCallback((code: string, exercicioId: string, value: number | undefined) => {
    setData((prev) => {
      const accounts = mapAccountTree(prev.accounts, code, (a) => ({
        ...a,
        values: { ...a.values, [exercicioId]: value as number },
      }))
      if (value === undefined) {
        // remove a chave em vez de gravar undefined
        const acc = findAndClean(accounts, code, exercicioId)
        return {
          ...prev,
          accounts: acc,
          auditLog: audit(prev, "Valor removido", `${code} · ${exercicioId} limpo.`),
        }
      }
      return {
        ...prev,
        accounts,
        auditLog: audit(prev, "Valor lançado", `${code} · ${exercicioId} = ${value}`),
      }
    })
  }, [audit])

  const updateDreValue = useCallback((exercicioId: string, lineId: string, value: number | undefined) => {
    setData((prev) => {
      const current = { ...(prev.dreByExercicio[exercicioId] ?? {}) }
      if (value === undefined) delete current[lineId]
      else current[lineId] = value
      return {
        ...prev,
        dreByExercicio: { ...prev.dreByExercicio, [exercicioId]: current },
        auditLog: audit(prev, "DRE atualizada", `${lineId} · ${exercicioId} = ${value ?? "—"}`),
      }
    })
  }, [audit])

  const addAccountNode = useCallback((parentCode: string | null, name: string, isGroup: boolean) => {
    setData((prev) => {
      if (parentCode === null) {
        const code = nextRootCode(prev.accounts)
        const node: Account = isGroup ? { code, name, children: [] } : { code, name, values: {} }
        return {
          ...prev,
          accounts: [...prev.accounts, node],
          auditLog: audit(prev, "Conta criada", `Grupo raiz "${name}" (${code}).`),
        }
      }
      const accounts = mapAccountTree(prev.accounts, parentCode, (parent) => {
        const code = nextChildCode(parent)
        const node: Account = isGroup ? { code, name, children: [] } : { code, name, values: {} }
        return { ...parent, children: [...(parent.children ?? []), node] }
      })
      return {
        ...prev,
        accounts,
        auditLog: audit(prev, "Conta criada", `"${name}" adicionada em ${parentCode}.`),
      }
    })
  }, [audit])

  const renameAccountNode = useCallback((code: string, name: string) => {
    setData((prev) => ({
      ...prev,
      accounts: mapAccountTree(prev.accounts, code, (a) => ({ ...a, name })),
      auditLog: audit(prev, "Conta renomeada", `${code} → "${name}".`),
    }))
  }, [audit])

  const deleteAccountNode = useCallback((code: string) => {
    setData((prev) => ({
      ...prev,
      accounts: removeAccountNode(prev.accounts, code),
      auditLog: audit(prev, "Conta removida", `${code} excluída do Plano de Contas.`),
    }))
  }, [audit])

  const confirmExtraction = useCallback((exercicioId: string, entries: { code: string; value: number }[], fileName: string) => {
    setData((prev) => {
      let accounts = prev.accounts
      for (const entry of entries) {
        accounts = mapAccountTree(accounts, entry.code, (a) => ({
          ...a,
          values: { ...a.values, [exercicioId]: entry.value },
        }))
      }
      return {
        ...prev,
        accounts,
        auditLog: audit(
          prev,
          "Extração confirmada",
          `${entries.length} conta(s) de "${fileName}" gravadas em ${exercicioId} (revisão humana concluída).`,
        ),
      }
    })
  }, [audit])

  const resetToSeed = useCallback(() => {
    setData(seedData())
  }, [])

  const value = useMemo<StoreApi>(
    () => ({
      ...data,
      hydrated,
      setCurrentUser,
      setSector,
      addExercicio,
      updateAccountValue,
      updateDreValue,
      addAccountNode,
      renameAccountNode,
      deleteAccountNode,
      confirmExtraction,
      resetToSeed,
    }),
    [
      data,
      hydrated,
      setCurrentUser,
      setSector,
      addExercicio,
      updateAccountValue,
      updateDreValue,
      addAccountNode,
      renameAccountNode,
      deleteAccountNode,
      confirmExtraction,
      resetToSeed,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

function findAndClean(accounts: Account[], code: string, exercicioId: string): Account[] {
  return accounts.map((account) => {
    if (account.code === code && account.values) {
      const values = { ...account.values }
      delete values[exercicioId]
      return { ...account, values }
    }
    if (account.children) return { ...account, children: findAndClean(account.children, code, exercicioId) }
    return account
  })
}

function removeAccountNode(accounts: Account[], code: string): Account[] {
  return accounts
    .filter((a) => a.code !== code)
    .map((a) => (a.children ? { ...a, children: removeAccountNode(a.children, code) } : a))
}

export function useFinancialStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useFinancialStore deve ser usado dentro de <FinancialDataProvider>")
  return ctx
}
