import Link from "next/link"
import { getAllSimulacroEjercicios } from "@/lib/content"
import { SimulacroFinalController } from "@/components/simulacro/SimulacroFinalController"

export default async function SimulacroFinalPage() {
  const ejercicios = await getAllSimulacroEjercicios()

  return (
    <article className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Simulacro Final</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight">Simulacro Final</h1>

      {ejercicios.length === 0 ? (
        <p className="text-muted-foreground italic">
          El simulacro final estará disponible cuando los módulos tengan contenido. ¡Vuelve pronto!
        </p>
      ) : (
        <SimulacroFinalController ejercicios={ejercicios} />
      )}
    </article>
  )
}
