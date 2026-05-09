"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Lightbulb, Target, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProgress } from "@/lib/storage"
import { ProgressBadge } from "./ProgressBadge"
import type { ModuloProgreso, EtapaEstado } from "@/types"

const STAGES = [
  {
    key: "teoria" as const,
    label: "Teoría",
    description: "Conceptos y explicaciones del tema",
    icon: BookOpen,
    href: "teoria",
    getEstado: (p: ModuloProgreso): EtapaEstado => p.teoria,
    getAciertos: (): number | undefined => undefined,
  },
  {
    key: "ejemplos" as const,
    label: "Ejemplos",
    description: "Ejercicios resueltos paso a paso",
    icon: Lightbulb,
    href: "ejemplos",
    getEstado: (p: ModuloProgreso): EtapaEstado => p.ejemplos,
    getAciertos: (): number | undefined => undefined,
  },
  {
    key: "practica" as const,
    label: "Práctica",
    description: "5 ejercicios interactivos con feedback",
    icon: Target,
    href: "practica",
    getEstado: (p: ModuloProgreso): EtapaEstado => p.practica.estado,
    getAciertos: (p: ModuloProgreso): number | undefined => p.practica.aciertos,
  },
  {
    key: "simulacro" as const,
    label: "Simulacro",
    description: "5 preguntas cronometradas sin pistas",
    icon: Timer,
    href: "simulacro",
    getEstado: (p: ModuloProgreso): EtapaEstado => p.simulacro.estado,
    getAciertos: (p: ModuloProgreso): number | undefined => p.simulacro.aciertos,
  },
]

export function StageSelector({ slug }: { slug: string }) {
  const [progreso, setProgreso] = useState<ModuloProgreso | null>(null)

  useEffect(() => {
    setProgreso(getProgress().modulos[slug] ?? null)
  }, [slug])

  if (!progreso) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {STAGES.map(({ key, label, description, icon: Icon, href, getEstado, getAciertos }) => {
        const estado = getEstado(progreso)
        const aciertos = getAciertos(progreso)

        return (
          <Link
            key={key}
            href={`/modulos/${slug}/${href}`}
            className={cn(
              "flex items-center gap-4 rounded-lg border bg-card p-4 min-h-[80px]",
              "hover:bg-accent/30 transition-colors",
              estado === "completada" && "border-success/40"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center size-10 rounded-lg shrink-0",
                estado === "completada"  && "bg-success/10 text-success",
                estado === "en_progreso" && "bg-primary/10 text-primary",
                estado === "no_iniciada" && "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{label}</span>
                <ProgressBadge
                  estado={estado}
                  aciertos={aciertos}
                  total={aciertos !== undefined ? 5 : undefined}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
