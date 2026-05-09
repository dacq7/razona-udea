"use client"
import { cn } from "@/lib/utils"
import { MathText } from "./MathText"
import type { Opcion } from "@/types"

interface Props {
  opciones: Opcion[]
  seleccionada: 'A' | 'B' | 'C' | 'D' | null
  haRespondido: boolean
  showFeedback?: boolean
  onSelect: (letra: 'A' | 'B' | 'C' | 'D') => void
}

type Variant = 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed'

function getVariant(
  opcion: Opcion,
  seleccionada: 'A' | 'B' | 'C' | 'D' | null,
  haRespondido: boolean,
  showFeedback: boolean
): Variant {
  if (!haRespondido) return seleccionada === opcion.letra ? 'selected' : 'default'
  if (!showFeedback) return seleccionada === opcion.letra ? 'selected' : 'dimmed'
  if (opcion.es_correcta) return 'correct'
  if (seleccionada === opcion.letra) return 'wrong'
  return 'dimmed'
}

export function OpcionesGrid({ opciones, seleccionada, haRespondido, showFeedback = true, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {opciones.map((opcion) => {
        const variant = getVariant(opcion, seleccionada, haRespondido, showFeedback)

        return (
          <button
            key={opcion.letra}
            disabled={haRespondido}
            onClick={() => onSelect(opcion.letra)}
            className={cn(
              "flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm text-left",
              "min-h-[48px] transition-colors",
              variant === 'default' && "bg-card border-border hover:bg-accent/30",
              variant === 'selected' && "bg-card border-primary ring-2 ring-primary ring-offset-0",
              variant === 'correct' && "bg-success/10 border-success",
              variant === 'wrong' && "bg-destructive/10 border-destructive",
              variant === 'dimmed' && "bg-card border-border opacity-60",
              haRespondido && "cursor-default"
            )}
          >
            <span className={cn(
              "flex items-center justify-center size-6 rounded-full text-xs font-bold shrink-0 mt-0.5",
              variant === 'correct' && "bg-success text-success-foreground",
              variant === 'wrong' && "bg-destructive text-destructive-foreground",
              variant === 'selected' && "bg-primary text-primary-foreground",
              (variant === 'default' || variant === 'dimmed') && "bg-muted text-muted-foreground"
            )}>
              {opcion.letra}
            </span>
            <span className={cn(
              "flex-1 leading-snug",
              variant === 'correct' && "text-success",
              variant === 'wrong' && "text-destructive"
            )}>
              <MathText text={opcion.texto} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
