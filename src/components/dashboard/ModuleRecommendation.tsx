"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getProgress } from "@/lib/storage"
import { getColorClasses } from "@/lib/colors"
import type { ModuleMeta, ProgressStore } from "@/types"

function isModuleComplete(progress: ProgressStore, slug: string): boolean {
  const m = progress.modulos[slug]
  if (!m) return false
  return (
    m.teoria === 'completada' &&
    m.ejemplos === 'completada' &&
    m.practica.estado === 'completada' &&
    m.simulacro.estado === 'completada'
  )
}

interface Props {
  modules: ModuleMeta[]
}

export function ModuleRecommendation({ modules }: Props) {
  const [loading, setLoading] = useState(true)
  const [recommended, setRecommended] = useState<ModuleMeta | 'all-complete' | null>(null)

  useEffect(() => {
    const progress = getProgress()
    const sorted = [...modules].sort((a, b) => a.orden_recomendado - b.orden_recomendado)
    const next = sorted.find((m) => !isModuleComplete(progress, m.slug))
    setRecommended(next ?? 'all-complete')
    setLoading(false)
  }, [modules])

  if (loading) {
    return <div className="h-24 rounded-lg bg-muted animate-pulse" />
  }

  if (recommended === 'all-complete') {
    return (
      <div className="rounded-lg border-2 border-success bg-success/5 p-4 space-y-2">
        <p className="font-semibold text-success">¡Has completado todo el currículo!</p>
        <p className="text-sm text-muted-foreground">
          Reta tu nivel con el Simulacro Final para simular las condiciones reales del examen.
        </p>
        <Link href="/simulacro-final">
          <Button size="sm" className="mt-1">Ir al Simulacro Final</Button>
        </Link>
      </div>
    )
  }

  if (!recommended) return null

  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[recommended.icono]
    ?? LucideIcons.BookOpen
  const colorClasses = getColorClasses(recommended.color)

  return (
    <div className="rounded-lg border-2 border-primary bg-accent/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Próximo recomendado
      </p>
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center justify-center size-11 rounded-lg shrink-0", colorClasses)}>
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm leading-snug">{recommended.titulo}</h2>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{recommended.descripcion}</p>
        </div>
        <Link href={`/modulos/${recommended.slug}`} className="shrink-0">
          <Button size="sm">Empezar aquí</Button>
        </Link>
      </div>
    </div>
  )
}
