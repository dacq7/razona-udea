"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SimulacroTimer } from "./SimulacroTimer"
import { NavigationDots } from "./NavigationDots"
import { OpcionesGrid } from "@/components/ejercicios/OpcionesGrid"
import { MathText } from "@/components/ejercicios/MathText"
import { formatTime } from "@/lib/utils"
import {
  getSimulacroEnCurso,
  saveSimulacroEnCurso,
  clearSimulacroEnCurso,
  saveSimulacroResult,
} from "@/lib/storage"
import type { EjercicioSimulacro, SimulacroEnCurso, SimulacroFinalResult } from "@/types"

const DURACION_BASE = 5400 // 90 min for 40 questions
const TOTAL_BASE = 40

type Letra = 'A' | 'B' | 'C' | 'D'
type Fase = 'bienvenida' | 'confirmando' | 'en_curso' | 'terminado'

interface Props {
  ejercicios: EjercicioSimulacro[]
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function SimulacroFinalController({ ejercicios }: Props) {
  const router = useRouter()
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router }, [router])

  // Duration scales proportionally when fewer exercises are available (see ADR-021)
  // useState lazy initializer: ejercicios.length never changes (stable Server prop)
  const [duracion] = useState(() =>
    ejercicios.length >= TOTAL_BASE
      ? DURACION_BASE
      : Math.max(60, Math.round((ejercicios.length / TOTAL_BASE) * DURACION_BASE))
  )

  const [fase, setFase] = useState<Fase>('bienvenida')
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, Letra>>({})
  const [inicioTimestamp, setInicioTimestamp] = useState<number | null>(null)
  const [ejerciciosOrdenados, setEjerciciosOrdenados] = useState<EjercicioSimulacro[]>([])
  const [sesionAnterior, setSesionAnterior] = useState<SimulacroEnCurso | null>(null)
  const [tiempoRestanteSesion, setTiempoRestanteSesion] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  // Refs for async-safe access in callbacks and intervals
  const respuestasRef = useRef<Record<string, Letra>>({})
  const inicioTimestampRef = useRef<number | null>(null)
  const ejerciciosOrdenadosRef = useRef<EjercicioSimulacro[]>([])
  const avisado10MinRef = useRef(false)
  const avisado2MinRef = useRef(false)

  // Sync refs with state via useEffect (react-hooks/refs compliance)
  useEffect(() => { inicioTimestampRef.current = inicioTimestamp }, [inicioTimestamp])
  useEffect(() => { ejerciciosOrdenadosRef.current = ejerciciosOrdenados }, [ejerciciosOrdenados])

  // All data accessed via refs or stable references — empty dep array intentional
  const finalizarSesion = useCallback((
    respuestasArg: Record<string, Letra>,
    inicioTs?: number
  ) => {
    const ts = inicioTs ?? inicioTimestampRef.current
    if (ts === null) return

    const tiempoUsado = Math.min(duracion, Math.floor((Date.now() - ts) / 1000))
    const exs = ejerciciosOrdenadosRef.current

    const puntajePorModulo: Record<string, { correctas: number; total: number }> = {}
    let aciertos = 0

    for (const e of exs) {
      const letraCorrecta = e.opciones.find((o) => o.es_correcta)?.letra
      const esCorrecta = respuestasArg[e.id] === letraCorrecta
      if (esCorrecta) aciertos++
      if (!puntajePorModulo[e.modulo_slug]) {
        puntajePorModulo[e.modulo_slug] = { correctas: 0, total: 0 }
      }
      puntajePorModulo[e.modulo_slug].total++
      if (esCorrecta) puntajePorModulo[e.modulo_slug].correctas++
    }

    const result: SimulacroFinalResult = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      puntaje_total: aciertos,
      tiempo_usado_segundos: tiempoUsado,
      respuestas: exs.map((e) => ({
        ejercicio_id: e.id,
        modulo_slug: e.modulo_slug,
        respuesta_elegida: (respuestasArg[e.id] as Letra | undefined) ?? null,
        es_correcta: respuestasArg[e.id] === e.opciones.find((o) => o.es_correcta)?.letra,
      })),
      puntaje_por_modulo: puntajePorModulo,
    }

    saveSimulacroResult(result)
    clearSimulacroEnCurso()
    setFase('terminado')
    routerRef.current.push('/simulacro-final/resultados')
  }, [duracion])

  // On mount: check for existing final simulacro session (no modulo_slug = final)
  useEffect(() => {
    const session = getSimulacroEnCurso()
    // modulo_slug is defined → it's a module simulacro, not the final one
    if (!session || session.modulo_slug !== undefined) return

    const elapsed = Math.floor((Date.now() - session.inicio_timestamp) / 1000)
    if (elapsed >= session.duracion_segundos) {
      // Expired — restore exercise order and finalize
      const exerciseMap = new Map(ejercicios.map((e) => [e.id, e]))
      const restored = session.preguntas_ids
        .map((id) => exerciseMap.get(id))
        .filter((e): e is EjercicioSimulacro => e !== undefined)
      ejerciciosOrdenadosRef.current = restored
      clearSimulacroEnCurso()
      finalizarSesion(session.respuestas as Record<string, Letra>, session.inicio_timestamp)
      return
    }
    setTiempoRestanteSesion(Math.max(0, session.duracion_segundos - elapsed))
    setSesionAnterior(session)
    setFase('confirmando')
  }, [ejercicios, finalizarSesion])

  // Auto-save every 30s while en_curso
  useEffect(() => {
    if (fase !== 'en_curso' || inicioTimestampRef.current === null) return

    const interval = setInterval(() => {
      if (inicioTimestampRef.current === null) return
      saveSimulacroEnCurso({
        inicio_timestamp: inicioTimestampRef.current,
        duracion_segundos: duracion,
        preguntas_ids: ejerciciosOrdenadosRef.current.map((e) => e.id),
        respuestas: respuestasRef.current,
        // no modulo_slug = this is the final simulacro
      })
    }, 30_000)

    return () => clearInterval(interval)
  }, [fase, duracion])

  // Time warnings: ≤600s (10 min) and ≤120s (2 min), each fires only once
  useEffect(() => {
    if (fase !== 'en_curso') return

    const interval = setInterval(() => {
      const ts = inicioTimestampRef.current
      if (!ts) return
      const remaining = Math.max(0, duracion - Math.floor((Date.now() - ts) / 1000))

      if (remaining <= 600 && !avisado10MinRef.current) {
        avisado10MinRef.current = true
        toast.warning("⏰ Quedan 10 minutos")
      }
      if (remaining <= 120 && !avisado2MinRef.current) {
        avisado2MinRef.current = true
        toast.error("⚠️ ¡Últimos 2 minutos!")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [fase, duracion])

  // Passes current answers explicitly — timer fires async, closure would be stale
  const handleTimeUp = useCallback(() => {
    finalizarSesion(respuestasRef.current)
  }, [finalizarSesion])

  function iniciarSimulacro() {
    const shuffled = shuffle(ejercicios)
    const ts = Date.now()
    inicioTimestampRef.current = ts
    respuestasRef.current = {}
    ejerciciosOrdenadosRef.current = shuffled
    avisado10MinRef.current = false
    avisado2MinRef.current = false
    setEjerciciosOrdenados(shuffled)
    setInicioTimestamp(ts)
    setRespuestas({})
    setPreguntaActual(0)
    setShowConfirm(false)
    saveSimulacroEnCurso({
      inicio_timestamp: ts,
      duracion_segundos: duracion,
      preguntas_ids: shuffled.map((e) => e.id),
      respuestas: {},
      // no modulo_slug = final simulacro
    })
    setFase('en_curso')
  }

  function continuarSesion(session: SimulacroEnCurso) {
    const resps = session.respuestas as Record<string, Letra>
    const exerciseMap = new Map(ejercicios.map((e) => [e.id, e]))
    const restored = session.preguntas_ids
      .map((id) => exerciseMap.get(id))
      .filter((e): e is EjercicioSimulacro => e !== undefined)

    const elapsed = Math.floor((Date.now() - session.inicio_timestamp) / 1000)
    const remaining = Math.max(0, session.duracion_segundos - elapsed)

    inicioTimestampRef.current = session.inicio_timestamp
    respuestasRef.current = resps
    ejerciciosOrdenadosRef.current = restored
    // Pre-set warning flags so already-passed thresholds don't fire again on resume
    avisado10MinRef.current = remaining <= 600
    avisado2MinRef.current = remaining <= 120

    setEjerciciosOrdenados(restored)
    setInicioTimestamp(session.inicio_timestamp)
    setRespuestas(resps)
    const firstUnanswered = restored.findIndex((e) => !resps[e.id])
    setPreguntaActual(firstUnanswered >= 0 ? firstUnanswered : 0)
    setShowConfirm(false)
    setFase('en_curso')
  }

  function handleSelect(letra: Letra) {
    const pregunta = ejerciciosOrdenados[preguntaActual]
    if (!pregunta) return
    const newResp = { ...respuestasRef.current, [pregunta.id]: letra }
    respuestasRef.current = newResp
    setRespuestas(newResp)
    setShowConfirm(false)
  }

  function handleSubmitClick() {
    const answered = Object.keys(respuestasRef.current).length
    if (answered < ejerciciosOrdenadosRef.current.length) {
      setShowConfirm(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      finalizarSesion(respuestasRef.current)
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────

  if (fase === 'terminado') {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="font-medium text-muted-foreground">Guardando resultados...</p>
      </div>
    )
  }

  if (fase === 'confirmando' && sesionAnterior) {
    const answered = Object.keys(sesionAnterior.respuestas).length
    const totalSesion = sesionAnterior.preguntas_ids.length
    return (
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Simulacro en curso</h2>
        <p className="text-sm text-muted-foreground">
          Tienes un simulacro en progreso con{" "}
          <span className="font-medium text-foreground">{formatTime(tiempoRestanteSesion)}</span>{" "}
          restantes y {answered}/{totalSesion} preguntas respondidas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => continuarSesion(sesionAnterior)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Continuar examen
          </button>
          <button
            onClick={() => { clearSimulacroEnCurso(); setFase('bienvenida') }}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px]"
          >
            Empezar nuevo
          </button>
        </div>
      </div>
    )
  }

  if (fase === 'bienvenida') {
    const isPartial = ejercicios.length < TOTAL_BASE
    return (
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Simulacro Final de Razonamiento Lógico</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {ejercicios.length} preguntas{isPartial ? ` (${TOTAL_BASE - ejercicios.length} módulos pendientes de contenido)` : ""}</li>
          <li>• {formatTime(duracion)} de tiempo</li>
          <li>• Puedes cambiar respuestas y saltar entre preguntas</li>
          <li>• Sin pistas — condiciones reales de examen</li>
          <li>• Feedback detallado al finalizar</li>
        </ul>
        <button
          onClick={iniciarSimulacro}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          Comenzar simulacro
        </button>
      </div>
    )
  }

  // en_curso
  const pregunta = ejerciciosOrdenados[preguntaActual]
  if (!pregunta || inicioTimestamp === null) return null

  const respondidas = ejerciciosOrdenados.map((e) => !!respuestas[e.id])
  const numRespondidas = respondidas.filter(Boolean).length
  const sinResponder = ejerciciosOrdenados.length - numRespondidas

  return (
    <div className="space-y-4">
      {/* Submit confirm banner */}
      {showConfirm && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 space-y-3">
          <p className="text-sm font-medium">
            Tienes <span className="text-amber-700 dark:text-amber-400">{sinResponder}</span>{" "}
            {sinResponder === 1 ? "pregunta sin responder" : "preguntas sin responder"}.
            ¿Enviar de todas formas?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => finalizarSesion(respuestasRef.current)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              Sí, enviar
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Timer + respondidas row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">
          {numRespondidas}/{ejerciciosOrdenados.length} respondidas
        </span>
        <SimulacroTimer
          inicioTimestamp={inicioTimestamp}
          duracionSegundos={duracion}
          onTimeUp={handleTimeUp}
          warningSeconds={-1}
        />
      </div>

      {/* Navigation dots */}
      <div className="rounded-lg border bg-card p-3">
        <NavigationDots
          total={ejerciciosOrdenados.length}
          actual={preguntaActual}
          respondidas={respondidas}
          onJump={setPreguntaActual}
        />
      </div>

      {/* Question number label */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Pregunta {preguntaActual + 1} de {ejerciciosOrdenados.length}
      </p>

      {/* Enunciado */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm leading-relaxed font-medium">
          <MathText text={pregunta.enunciado} />
        </p>
      </div>

      {/* Options — no feedback, answers can be changed freely */}
      <OpcionesGrid
        opciones={pregunta.opciones}
        seleccionada={respuestas[pregunta.id] ?? null}
        haRespondido={false}
        showFeedback={false}
        onSelect={handleSelect}
      />

      {/* Navigation + submit row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          disabled={preguntaActual === 0}
          onClick={() => setPreguntaActual((p) => Math.max(0, p - 1))}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px] disabled:opacity-40 disabled:pointer-events-none"
        >
          ← Anterior
        </button>
        <button
          disabled={preguntaActual === ejerciciosOrdenados.length - 1}
          onClick={() => setPreguntaActual((p) => Math.min(ejerciciosOrdenados.length - 1, p + 1))}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px] disabled:opacity-40 disabled:pointer-events-none"
        >
          Siguiente →
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSubmitClick}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          Enviar simulacro
        </button>
      </div>
    </div>
  )
}
