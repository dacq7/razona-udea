"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSimulacros } from "@/lib/storage"
import { MODULES } from "@/lib/modules"
import { getLucideIcon } from "@/lib/icons"
import { calcularPorcentaje, formatTime, cn } from "@/lib/utils"
import { FeedbackPanel } from "@/components/ejercicios/FeedbackPanel"
import { MathText } from "@/components/ejercicios/MathText"
import type { SimulacroFinalResult, EjercicioSimulacro } from "@/types"

interface Props {
  ejerciciosByID: Record<string, EjercicioSimulacro>
}

type Letra = 'A' | 'B' | 'C' | 'D'

function scoreColor(p: number) {
  if (p >= 85) return "text-success"
  if (p >= 70) return "text-primary"
  if (p >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-destructive"
}

function scoreMessage(p: number) {
  if (p >= 85) return "¡Excelente! Estás muy bien preparada"
  if (p >= 70) return "Buen dominio, sigue afinando los detalles"
  if (p >= 50) return "Buen primer intento, hay áreas claras para mejorar"
  return "Sigue estudiando, identifica las áreas más débiles"
}

function barColor(p: number) {
  if (p >= 85) return "bg-success"
  if (p >= 70) return "bg-primary"
  if (p >= 50) return "bg-amber-500"
  return "bg-destructive"
}

export function ResultadosClient({ ejerciciosByID }: Props) {
  const router = useRouter()
  const [resultado, setResultado] = useState<SimulacroFinalResult | null>(null)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    const historial = getSimulacros().historial
    setResultado(historial[0] ?? null)
    setCargado(true)
  }, [])

  if (!cargado) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-lg bg-muted" />
        <div className="h-12 rounded-lg bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    )
  }

  if (!resultado || resultado.respuestas.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 space-y-4 text-center">
        <p className="text-muted-foreground">Aún no has completado ningún simulacro.</p>
        <Link
          href="/simulacro-final"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          Empezar simulacro →
        </Link>
      </div>
    )
  }

  const totalPreguntas = resultado.respuestas.length
  const porcentaje = calcularPorcentaje(resultado.puntaje_total, totalPreguntas)

  // Module breakdown — sorted ascending by % (worst first, most pedagogically useful)
  const modDesglose = Object.entries(resultado.puntaje_por_modulo)
    .map(([slug, stats]) => {
      const mod = MODULES.find((m) => m.slug === slug)
      if (!mod) return null
      return {
        slug,
        titulo: mod.titulo,
        icono: mod.icono,
        porcentaje: calcularPorcentaje(stats.correctas, stats.total),
        correctas: stats.correctas,
        total: stats.total,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.porcentaje - b.porcentaje)

  const peorSlug = modDesglose[0]?.slug

  // Error review — wrong answers and unanswered, preserving original order (question number)
  const errores = resultado.respuestas
    .map((r, idx) => ({ ...r, numeroPregunta: idx + 1, ejercicio: ejerciciosByID[r.ejercicio_id] }))
    .filter((item) => !item.es_correcta && item.ejercicio !== undefined)

  return (
    <div className="space-y-8">

      {/* ── Score card ─────────────────────────────────────────── */}
      <div className="rounded-lg border bg-card p-6 text-center space-y-2">
        <p className={cn("text-5xl font-bold tabular-nums", scoreColor(porcentaje))}>
          {resultado.puntaje_total}/{totalPreguntas}
        </p>
        <p className={cn("text-lg font-semibold tabular-nums", scoreColor(porcentaje))}>
          {porcentaje}%
        </p>
        <p className="text-muted-foreground text-sm">{scoreMessage(porcentaje)}</p>
        <p className="text-xs text-muted-foreground">
          Tiempo utilizado: <span className="font-medium text-foreground">{formatTime(resultado.tiempo_usado_segundos)}</span>
        </p>
      </div>

      {/* ── Module breakdown ───────────────────────────────────── */}
      {modDesglose.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Desempeño por módulo</h2>
          <p className="text-xs text-muted-foreground -mt-1">Ordenado de menor a mayor — empieza por los más débiles</p>
          <div className="space-y-3">
            {modDesglose.map((mod) => {
              const Icon = getLucideIcon(mod.icono)
              return (
                <div key={mod.slug} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="size-4 text-muted-foreground shrink-0" aria-hidden />
                      <span className="text-sm font-medium truncate">{mod.titulo}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("text-sm font-bold tabular-nums", scoreColor(mod.porcentaje))}>
                        {mod.correctas}/{mod.total}
                      </span>
                      <Link
                        href={`/modulos/${mod.slug}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Estudiar →
                      </Link>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", barColor(mod.porcentaje))}
                      style={{ width: `${mod.porcentaje}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{mod.porcentaje}% de respuestas correctas</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Error review ───────────────────────────────────────── */}
      {errores.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-base font-semibold">
            Repasa estas preguntas{" "}
            <span className="text-muted-foreground font-normal text-sm">({errores.length})</span>
          </h2>
          <div className="space-y-6">
            {errores.map((item) => (
              <div key={item.ejercicio_id} className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Pregunta {item.numeroPregunta}
                  </p>
                  {!item.respuesta_elegida && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Sin responder
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  <MathText text={item.ejercicio.enunciado} />
                </p>
                {item.respuesta_elegida ? (
                  <FeedbackPanel
                    opciones={item.ejercicio.opciones}
                    letraSeleccionada={item.respuesta_elegida as Letra}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic rounded-lg border p-3">
                    No respondida. La respuesta correcta era{" "}
                    <span className="font-medium text-foreground">
                      {item.ejercicio.opciones.find((o) => o.es_correcta)?.letra}
                    </span>.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {errores.length === 0 && (
        <p className="text-center text-success font-medium py-4">
          ¡Respondiste todo correctamente! 🎉
        </p>
      )}

      {/* ── Action buttons ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => router.push('/simulacro-final')}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px]"
        >
          Repetir simulacro
        </button>
        {peorSlug && (
          <Link
            href={`/modulos/${peorSlug}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Estudiar módulo más débil
          </Link>
        )}
      </div>
    </div>
  )
}
