"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getProgress } from "@/lib/storage"
import { getColorClasses } from "@/lib/colors"
import type { ModuleMeta, ModuloProgreso, EtapaEstado } from "@/types"

const STAGES: { key: keyof Pick<ModuloProgreso, 'teoria' | 'ejemplos'>; label: string }[] = [
  { key: 'teoria',   label: 'Teoría' },
  { key: 'ejemplos', label: 'Ejemplos' },
]
const NESTED_STAGES: { key: 'practica' | 'simulacro'; label: string }[] = [
  { key: 'practica',  label: 'Práctica' },
  { key: 'simulacro', label: 'Simulacro' },
]

function getStageEstados(p: ModuloProgreso): EtapaEstado[] {
  return [
    p.teoria,
    p.ejemplos,
    p.practica.estado,
    p.simulacro.estado,
  ]
}

function StageBadge({ label, estado }: { label: string; estado: EtapaEstado }) {
  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded-full font-medium",
        estado === 'completada'  && "bg-success/20 text-success",
        estado === 'en_progreso' && "bg-primary/20 text-primary",
        estado === 'no_iniciada' && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  )
}

export function ProgressCard({ modulo }: { modulo: ModuleMeta }) {
  const [progreso, setProgreso] = useState<ModuloProgreso | null>(null)

  useEffect(() => {
    const store = getProgress()
    setProgreso(store.modulos[modulo.slug] ?? null)
  }, [modulo.slug])

  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[modulo.icono]
    ?? LucideIcons.BookOpen
  const colorClasses = getColorClasses(modulo.color)

  const etapasCompletadas = progreso
    ? getStageEstados(progreso).filter((e) => e === 'completada').length
    : 0
  const progressValue = (etapasCompletadas / 4) * 100

  return (
    <Link
      href={`/modulos/${modulo.slug}`}
      className="block rounded-lg border bg-card p-4 hover:bg-accent/30 transition-colors"
    >
      <div className="flex gap-3">
        <div className={cn("flex items-center justify-center size-10 rounded-lg shrink-0", colorClasses)}>
          <Icon className="size-5" aria-hidden />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight">{modulo.titulo}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{modulo.descripcion}</p>

          {!progreso ? (
            <div className="mt-3 space-y-2">
              <div className="h-1 bg-muted animate-pulse rounded-full" />
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-12 bg-muted animate-pulse rounded-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <Progress value={progressValue} />
              <div className="flex flex-wrap gap-1">
                {STAGES.map(({ key, label }) => (
                  <StageBadge key={key} label={label} estado={progreso[key]} />
                ))}
                {NESTED_STAGES.map(({ key, label }) => (
                  <StageBadge key={key} label={label} estado={progreso[key].estado} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
