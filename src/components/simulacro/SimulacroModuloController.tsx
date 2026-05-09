"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SimulacroTimer } from "./SimulacroTimer"
import { SimulacroProgress } from "./SimulacroProgress"
import { OpcionesGrid } from "@/components/ejercicios/OpcionesGrid"
import { FeedbackPanel } from "@/components/ejercicios/FeedbackPanel"
import { MathText } from "@/components/ejercicios/MathText"
import { calcularPorcentaje, formatTime, shuffle, shuffleOpciones } from "@/lib/utils"
import {
  getProgress,
  updateModuloEtapa,
  getSimulacroEnCurso,
  saveSimulacroEnCurso,
  clearSimulacroEnCurso,
} from "@/lib/storage"
import type { EjercicioSimulacro, ModuloProgreso, SimulacroEnCurso } from "@/types"

const DURACION = 300 // 5 minutes
const SESION_SIZE = 5

interface Props {
  slug: string
  titulo: string
  ejercicios: EjercicioSimulacro[] // full bank from server
}

type Letra = 'A' | 'B' | 'C' | 'D'
type Fase = 'bienvenida' | 'confirmando' | 'en_curso' | 'terminado'

export function SimulacroModuloController({ slug, titulo, ejercicios }: Props) {
  const [fase, setFase] = useState<Fase>('bienvenida')
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, Letra>>({})
  const [inicioTimestamp, setInicioTimestamp] = useState<number | null>(null)
  const [sesionAnterior, setSesionAnterior] = useState<SimulacroEnCurso | null>(null)
  const [tiempoRestanteSesion, setTiempoRestanteSesion] = useState(0)
  const [respuestasFinales, setRespuestasFinales] = useState<Record<string, Letra> | null>(null)
  // Session exercises: shuffled subset of bank (set in iniciarSimulacro / continuarSesion)
  const [ejerciciosEnSesion, setEjerciciosEnSesion] = useState<EjercicioSimulacro[]>([])

  // Refs for async-safe access in callbacks and timers
  const respuestasRef = useRef<Record<string, Letra>>({})
  const inicioTimestampRef = useRef<number | null>(null)
  // Tracks the session exercises (not the full bank prop)
  const ejerciciosRef = useRef<EjercicioSimulacro[]>([])
  const slugRef = useRef(slug)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync refs with state via useEffect (react-hooks/refs compliance)
  useEffect(() => { slugRef.current = slug }, [slug])
  useEffect(() => { inicioTimestampRef.current = inicioTimestamp }, [inicioTimestamp])
  useEffect(() => { ejerciciosRef.current = ejerciciosEnSesion }, [ejerciciosEnSesion])

  const finalizarSesion = useCallback((
    respuestasArg: Record<string, Letra>,
    inicioTs?: number
  ) => {
    const ts = inicioTs ?? inicioTimestampRef.current
    if (ts === null) return

    const tiempoUsado = Math.min(DURACION, Math.floor((Date.now() - ts) / 1000))
    const exs = ejerciciosRef.current
    const sl = slugRef.current

    const aciertosNuevos = exs.filter((e) => {
      const letraCorrecta = e.opciones.find((o) => o.es_correcta)?.letra
      return respuestasArg[e.id] === letraCorrecta
    }).length

    const progress = getProgress()
    const simActual = progress.modulos[sl]?.simulacro
    const intentosAnteriores = simActual?.intentos ?? 0
    const nuevosIntentos = intentosAnteriores + 1
    const tiempoPromedioActual = simActual?.tiempo_promedio_segundos ?? 0
    const nuevoTiempoPromedio = Math.round(
      (tiempoPromedioActual * intentosAnteriores + tiempoUsado) / nuevosIntentos
    )

    const simNuevo: ModuloProgreso['simulacro'] = {
      estado: 'completada',
      aciertos: Math.max(simActual?.aciertos ?? 0, aciertosNuevos),
      intentos: nuevosIntentos,
      tiempo_promedio_segundos: nuevoTiempoPromedio,
    }
    updateModuloEtapa(sl, 'simulacro', simNuevo)
    clearSimulacroEnCurso()

    setRespuestasFinales(respuestasArg)
    setFase('terminado')
  }, [])

  // On mount: check for existing session
  useEffect(() => {
    const session = getSimulacroEnCurso()
    if (!session || session.modulo_slug !== slug) return

    const elapsed = Math.floor((Date.now() - session.inicio_timestamp) / 1000)
    if (elapsed >= session.duracion_segundos) {
      // Restore exercise order before finalizing so scoring uses the right set
      const exerciseMap = new Map(ejercicios.map((e) => [e.id, e]))
      const restored = session.preguntas_ids
        .map((id) => exerciseMap.get(id))
        .filter((e): e is EjercicioSimulacro => e !== undefined)
      ejerciciosRef.current = restored
      clearSimulacroEnCurso()
      finalizarSesion(session.respuestas as Record<string, Letra>, session.inicio_timestamp)
      return
    }
    setTiempoRestanteSesion(Math.max(0, DURACION - elapsed))
    setSesionAnterior(session)
    setFase('confirmando')
  }, [slug, ejercicios, finalizarSesion])

  // Auto-save every 30s while en_curso
  useEffect(() => {
    if (fase !== 'en_curso' || inicioTimestampRef.current === null) return

    const interval = setInterval(() => {
      if (inicioTimestampRef.current === null) return
      saveSimulacroEnCurso({
        inicio_timestamp: inicioTimestampRef.current,
        duracion_segundos: DURACION,
        preguntas_ids: ejerciciosRef.current.map((e) => e.id),
        respuestas: respuestasRef.current,
        modulo_slug: slugRef.current,
      })
    }, 30_000)

    return () => clearInterval(interval)
  }, [fase])

  // Cleanup advance timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    }
  }, [])

  const handleTimeUp = useCallback(() => {
    finalizarSesion(respuestasRef.current)
  }, [finalizarSesion])

  function iniciarSimulacro() {
    const sesion = shuffle(ejercicios)
      .slice(0, Math.min(SESION_SIZE, ejercicios.length))
      .map(shuffleOpciones)
    const ts = Date.now()
    inicioTimestampRef.current = ts
    respuestasRef.current = {}
    ejerciciosRef.current = sesion // set directly so callbacks have it before re-render
    setEjerciciosEnSesion(sesion)
    setInicioTimestamp(ts)
    setRespuestas({})
    setPreguntaActual(0)
    saveSimulacroEnCurso({
      inicio_timestamp: ts,
      duracion_segundos: DURACION,
      preguntas_ids: sesion.map((e) => e.id),
      respuestas: {},
      modulo_slug: slug,
    })
    setFase('en_curso')
  }

  function continuarSesion(session: SimulacroEnCurso) {
    const resps = session.respuestas as Record<string, Letra>
    // Restore shuffled exercise order; options in original JSON order (see ADR-022)
    const exerciseMap = new Map(ejercicios.map((e) => [e.id, e]))
    const restored = session.preguntas_ids
      .map((id) => exerciseMap.get(id))
      .filter((e): e is EjercicioSimulacro => e !== undefined)

    inicioTimestampRef.current = session.inicio_timestamp
    respuestasRef.current = resps
    ejerciciosRef.current = restored
    setEjerciciosEnSesion(restored)
    setInicioTimestamp(session.inicio_timestamp)
    setRespuestas(resps)
    const firstUnanswered = restored.findIndex((e) => !resps[e.id])
    setPreguntaActual(firstUnanswered >= 0 ? firstUnanswered : restored.length - 1)
    setFase('en_curso')
  }

  function handleSelect(letra: Letra) {
    const pregunta = ejerciciosRef.current[preguntaActual]
    if (!pregunta || respuestasRef.current[pregunta.id]) return

    const newResp = { ...respuestasRef.current, [pregunta.id]: letra }
    respuestasRef.current = newResp
    setRespuestas(newResp)

    advanceTimerRef.current = setTimeout(() => {
      if (preguntaActual < ejerciciosRef.current.length - 1) {
        setPreguntaActual((prev) => prev + 1)
      } else {
        finalizarSesion(newResp)
      }
    }, 400)
  }

  function reiniciar() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    setFase('bienvenida')
    setPreguntaActual(0)
    setRespuestas({})
    setInicioTimestamp(null)
    setRespuestasFinales(null)
    setEjerciciosEnSesion([])
    respuestasRef.current = {}
    inicioTimestampRef.current = null
    ejerciciosRef.current = []
  }

  // ── RENDER ──────────────────────────────────────────────────────────────

  if (fase === 'confirmando' && sesionAnterior) {
    return (
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Simulacro en curso</h2>
        <p className="text-sm text-muted-foreground">
          Tienes un simulacro anterior con{" "}
          <span className="font-medium text-foreground">{formatTime(tiempoRestanteSesion)}</span> restantes y{" "}
          {Object.keys(sesionAnterior.respuestas).length}/{sesionAnterior.preguntas_ids.length} preguntas respondidas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => continuarSesion(sesionAnterior)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Continuar
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
    return (
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Simulacro: {titulo}</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {Math.min(SESION_SIZE, ejercicios.length)} preguntas</li>
          <li>• 5 minutos</li>
          <li>• Sin pistas</li>
          <li>• Feedback completo al finalizar</li>
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

  if (fase === 'terminado' && respuestasFinales) {
    const aciertos = ejerciciosEnSesion.filter((e) => {
      const letraCorrecta = e.opciones.find((o) => o.es_correcta)?.letra
      return respuestasFinales[e.id] === letraCorrecta
    }).length
    const porcentaje = calcularPorcentaje(aciertos, ejerciciosEnSesion.length)

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 text-center space-y-3">
          <p className="text-4xl font-bold tabular-nums">{aciertos}/{ejerciciosEnSesion.length}</p>
          <p className="text-muted-foreground">{porcentaje}% de respuestas correctas</p>
          <p className={porcentaje >= 60 ? "text-success font-medium" : "text-muted-foreground"}>
            {porcentaje >= 80 ? "¡Dominio excelente!" : porcentaje >= 60 ? "¡Buen resultado!" : "Sigue practicando, ¡lo lograrás!"}
          </p>
        </div>

        <div className="space-y-4">
          {ejerciciosEnSesion.map((e, i) => {
            const letraSeleccionada = respuestasFinales[e.id]
            return (
              <div key={e.id} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pregunta {i + 1}
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  <MathText text={e.enunciado} />
                </p>
                {letraSeleccionada
                  ? <FeedbackPanel opciones={e.opciones} letraSeleccionada={letraSeleccionada} />
                  : <p className="text-sm text-muted-foreground italic rounded-lg border p-3">
                      Pregunta no respondida. La respuesta correcta era{" "}
                      <span className="font-medium">
                        {e.opciones.find((o) => o.es_correcta)?.letra}
                      </span>.
                    </p>
                }
              </div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={reiniciar}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm border border-border hover:bg-accent transition-colors min-h-[44px]"
          >
            Intentar de nuevo
          </button>
          <Link
            href={`/modulos/${slug}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Volver al módulo
          </Link>
        </div>
      </div>
    )
  }

  // en_curso
  const pregunta = ejerciciosEnSesion[preguntaActual]
  if (!pregunta || inicioTimestamp === null) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SimulacroProgress actual={preguntaActual + 1} total={ejerciciosEnSesion.length} />
        <SimulacroTimer
          inicioTimestamp={inicioTimestamp}
          duracionSegundos={DURACION}
          onTimeUp={handleTimeUp}
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm leading-relaxed font-medium">
          <MathText text={pregunta.enunciado} />
        </p>
      </div>

      <OpcionesGrid
        opciones={pregunta.opciones}
        seleccionada={respuestas[pregunta.id] ?? null}
        haRespondido={!!respuestas[pregunta.id]}
        showFeedback={false}
        onSelect={handleSelect}
      />
    </div>
  )
}
