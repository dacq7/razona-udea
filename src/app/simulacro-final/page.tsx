import Link from "next/link"
import { getSimulacroEjerciciosPorModulo } from "@/lib/content"
import { SimulacroFinalController } from "@/components/simulacro/SimulacroFinalController"

export default async function SimulacroFinalPage() {
  const ejerciciosPorModulo = await getSimulacroEjerciciosPorModulo()

  const totalDisponibles = Object.values(ejerciciosPorModulo).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  return (
    <article className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Simulacro Final</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight">Simulacro Final</h1>

      {totalDisponibles === 0 ? (
        <p className="text-muted-foreground italic">
          El simulacro final estará disponible cuando los módulos tengan contenido. ¡Vuelve pronto!
        </p>
      ) : (
        <SimulacroFinalController ejerciciosPorModulo={ejerciciosPorModulo} />
      )}
    </article>
  )
}
