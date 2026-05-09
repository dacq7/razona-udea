"use client"
import { useState } from "react"
import Link from "next/link"
import { PreguntaInteractiva } from "./PreguntaInteractiva"
import { calcularPorcentaje } from "@/lib/utils"
import { getProgress, updateModuloEtapa } from "@/lib/storage"
import type { EjercicioPractica, ModuloProgreso } from "@/types"

interface Props {
  slug: string
  ejercicios: EjercicioPractica[]
}

interface Resultado {
  es_correcta: boolean
}

export function PracticaController({ slug, ejercicios }: Props) {
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [seleccionada, setSeleccionada] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [pistaRevelada, setPistaRevelada] = useState(false)
  const [haRespondido, setHaRespondido] = useState(false)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [sesionTerminada, setSesionTerminada] = useState(false)

  const total = ejercicios.length
  const pregunta = ejercicios[preguntaActual]

  function handleSelect(letra: 'A' | 'B' | 'C' | 'D') {
    if (haRespondido) return
    const esCorrecta = pregunta.opciones.find((o) => o.letra === letra)?.es_correcta ?? false
    setSeleccionada(letra)
    setHaRespondido(true)
    setResultados((prev) => [...prev, { es_correcta: esCorrecta }])
  }

  function handleSiguiente() {
    if (preguntaActual < total - 1) {
      setPreguntaActual((prev) => prev + 1)
      setSeleccionada(null)
      setPistaRevelada(false)
      setHaRespondido(false)
    } else {
      finalizarSesion()
    }
  }

  function finalizarSesion() {
    // resultados reflects the state after the last question was answered
    // (this handler runs after React commits the setResultados from handleSelect)
    const aciertosNuevos = resultados.filter((r) => r.es_correcta).length

    const progress = getProgress()
    const practicaActual = progress.modulos[slug]?.practica
    const mejorAciertos = Math.max(practicaActual?.aciertos ?? 0, aciertosNuevos)
    const nuevosIntentos = (practicaActual?.intentos ?? 0) + 1

    const nuevaPractica: ModuloProgreso['practica'] = {
      estado: 'completada',
      aciertos: mejorAciertos,
      intentos: nuevosIntentos,
    }
    updateModuloEtapa(slug, 'practica', nuevaPractica)
    setSesionTerminada(true)
  }

  function reintentar() {
    setPreguntaActual(0)
    setSeleccionada(null)
    setPistaRevelada(false)
    setHaRespondido(false)
    setResultados([])
    setSesionTerminada(false)
  }

  if (sesionTerminada) {
    const aciertos = resultados.filter((r) => r.es_correcta).length
    const porcentaje = calcularPorcentaje(aciertos, total)

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 text-center space-y-3">
          <p className="text-4xl font-bold tabular-nums">{aciertos}/{total}</p>
          <p className="text-muted-foreground">{porcentaje}% de respuestas correctas</p>
          <p className={porcentaje >= 60 ? "text-success font-medium" : "text-muted-foreground"}>
            {porcentaje >= 80
              ? "¡Excelente dominio!"
              : porcentaje >= 60
                ? "¡Buen trabajo!"
                : "Sigue practicando, ¡tú puedes!"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reintentar}
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

  if (!pregunta) return null

  return (
    <PreguntaInteractiva
      pregunta={pregunta}
      index={preguntaActual}
      total={total}
      seleccionada={seleccionada}
      pistaRevelada={pistaRevelada}
      haRespondido={haRespondido}
      onSelect={handleSelect}
      onReveal={() => setPistaRevelada(true)}
      onSiguiente={handleSiguiente}
    />
  )
}
