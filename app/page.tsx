"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { PlanoDeContasScreen } from "@/components/screens/plano-de-contas-screen"
import { TabulacaoScreen } from "@/components/screens/tabulacao-screen"
import { DemonstracoesScreen } from "@/components/screens/demonstracoes-screen"
import { IndicesScreen } from "@/components/screens/indices-screen"
import { OpiniaoDeVendaScreen } from "@/components/screens/opiniao-de-venda-screen"
import { ExtracaoIaScreen } from "@/components/screens/extracao-ia-screen"
import type { ScreenId } from "@/lib/navigation"

export default function Page() {
  const [screen, setScreen] = useState<ScreenId>("opiniao-de-venda")

  return (
    <div className="flex min-h-dvh bg-background">
      <div className="sticky top-0 h-dvh">
        <AppSidebar active={screen} onNavigate={setScreen} />
      </div>

      <main className="min-w-0 flex-1">
        {screen === "dashboard" && <DashboardScreen />}
        {screen === "plano-de-contas" && <PlanoDeContasScreen />}
        {screen === "tabulacao" && <TabulacaoScreen />}
        {screen === "demonstracoes" && <DemonstracoesScreen />}
        {screen === "indices" && <IndicesScreen />}
        {screen === "opiniao-de-venda" && <OpiniaoDeVendaScreen onNavigate={setScreen} />}
        {screen === "extracao-ia" && <ExtracaoIaScreen onNavigate={setScreen} />}
      </main>
    </div>
  )
}
