"use client"
import { cn } from "@/lib/utils"
import { MathText } from "./MathText"
import { OpcionesGrid } from "./OpcionesGrid"
import { PistaButton } from "./PistaButton"
import { FeedbackPanel } from "./FeedbackPanel"
import type { EjercicioPractica } from "@/types"

interface Props {
  pregunta: EjercicioPractica
  index: number
  total: number
  seleccionada: 'A' | 'B' | 'C' | 'D' | null
  pistaRevelada: boolean
  haRespondido: boolean
  onSelect: (letra: 'A' | 'B' | 'C' | 'D') => void
  onReveal: () => void
  onSiguiente: () => void
}

export function PreguntaInteractiva({
  pregunta,
  index,
  total,
  seleccionada,
  pistaRevelada,
  haRespondido,
  onSelect,
  onReveal,
  onSiguiente,
}: Props) {
  const esUltima = index === total - 1

  return (
    <div className="space-y-4">
      {/* Progress */}
      <p className="text-xs font-medium text-muted-foreground">
        Pregunta {index + 1} de {total}
      </p>

      {/* Enunciado */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm leading-relaxed font-medium">
          <MathText text={pregunta.enunciado} />
        </p>
      </div>

      {/* Pista — solo visible antes de responder */}
      {!haRespondido && (
        <PistaButton
          pista={pregunta.pista}
          revelada={pistaRevelada}
          onReveal={onReveal}
        />
      )}

      {/* Opciones */}
      <OpcionesGrid
        opciones={pregunta.opciones}
        seleccionada={seleccionada}
        haRespondido={haRespondido}
        onSelect={onSelect}
      />

      {/* Feedback + navegación — solo después de responder */}
      {haRespondido && seleccionada && (
        <>
          <FeedbackPanel
            opciones={pregunta.opciones}
            letraSeleccionada={seleccionada}
          />
          <div className="flex justify-end">
            <button
              onClick={onSiguiente}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-colors min-h-[44px]"
              )}
            >
              {esUltima ? "Ver resultado" : "Siguiente pregunta →"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
