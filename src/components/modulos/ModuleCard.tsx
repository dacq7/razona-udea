"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getProgress } from "@/lib/storage"
import { getColorClasses } from "@/lib/colors"
import { getLucideIcon } from "@/lib/icons"
import type { ModuleMeta, ModuloProgreso, EtapaEstado } from "@/types"

function countCompletadas(p: ModuloProgreso): number {
  const estados: EtapaEstado[] = [
    p.teoria,
    p.ejemplos,
    p.practica.estado,
    p.simulacro.estado,
  ]
  return estados.filter((e) => e === "completada").length
}

export function ModuleCard({ modulo }: { modulo: ModuleMeta }) {
  const [progreso, setProgreso] = useState<ModuloProgreso | null>(null)

  useEffect(() => {
    setProgreso(getProgress().modulos[modulo.slug] ?? null)
  }, [modulo.slug])

  const Icon = getLucideIcon(modulo.icono)
  const colorClasses = getColorClasses(modulo.color)
  const completadas = progreso ? countCompletadas(progreso) : 0

  return (
    <Link
      href={`/modulos/${modulo.slug}`}
      className="flex flex-col rounded-lg border bg-card p-5 gap-4 hover:bg-accent/30 transition-colors"
    >
      <div className={cn("flex items-center justify-center size-14 rounded-xl self-start", colorClasses)}>
        <Icon className="size-8" aria-hidden />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-tight">{modulo.titulo}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{modulo.descripcion}</p>
      </div>

      {!progreso ? (
        <div className="space-y-1.5">
          <div className="h-1 bg-muted animate-pulse rounded-full" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Progress value={(completadas / 4) * 100} />
          <p className="text-xs text-muted-foreground">{completadas}/4 etapas</p>
        </div>
      )}
    </Link>
  )
}
