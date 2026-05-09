import Link from "next/link"
import { getAllSimulacroEjercicios } from "@/lib/content"
import { ResultadosClient } from "./ResultadosClient"
import type { EjercicioSimulacro } from "@/types"

export default async function ResultadosPage() {
  const ejercicios = await getAllSimulacroEjercicios()
  const ejerciciosByID: Record<string, EjercicioSimulacro> = Object.fromEntries(
    ejercicios.map((e) => [e.id, e])
  )

  return (
    <article className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/simulacro-final" className="hover:text-foreground transition-colors">Simulacro Final</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Resultados</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight">Resultados del Simulacro</h1>

      <ResultadosClient ejerciciosByID={ejerciciosByID} />
    </article>
  )
}
