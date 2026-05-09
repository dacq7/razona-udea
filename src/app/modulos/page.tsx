import { MODULES } from "@/lib/modules"
import { ModuleCard } from "@/components/modulos/ModuleCard"

export const metadata = {
  title: "Razona UdeA — Módulos",
}

export default function ModulosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Todos los módulos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((modulo) => (
          <ModuleCard key={modulo.slug} modulo={modulo} />
        ))}
      </div>
    </div>
  )
}
