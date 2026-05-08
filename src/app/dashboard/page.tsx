import { MODULES } from "@/lib/modules"
import { StatsRow } from "@/components/dashboard/StatsRow"
import { ModuleRecommendation } from "@/components/dashboard/ModuleRecommendation"
import { ProgressCard } from "@/components/dashboard/ProgressCard"

export const metadata = {
  title: "Razona UdeA — Tu progreso",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tu progreso</h1>
      <StatsRow />
      <ModuleRecommendation modules={MODULES} />
      <section>
        <h2 className="text-lg font-semibold mb-4">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((modulo) => (
            <ProgressCard key={modulo.slug} modulo={modulo} />
          ))}
        </div>
      </section>
    </div>
  )
}
