import { CheckCircle, XCircle, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { MathText } from "./MathText"
import type { Opcion } from "@/types"

interface Props {
  opciones: Opcion[]
  letraSeleccionada: 'A' | 'B' | 'C' | 'D'
}

export function FeedbackPanel({ opciones, letraSeleccionada }: Props) {
  const opcionSeleccionada = opciones.find((o) => o.letra === letraSeleccionada)
  const esCorrecta = opcionSeleccionada?.es_correcta ?? false

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Result header */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 font-semibold text-sm",
        esCorrecta ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {esCorrecta
          ? <><CheckCircle className="size-5" aria-hidden /> Correcto</>
          : <><XCircle className="size-5" aria-hidden /> Incorrecto</>
        }
      </div>

      {/* Per-option explanations */}
      <ul className="divide-y">
        {opciones.map((opcion) => {
          const isSelected = opcion.letra === letraSeleccionada
          const isCorrect = opcion.es_correcta

          return (
            <li
              key={opcion.letra}
              className={cn("px-4 py-3 text-sm", isCorrect && "bg-success/5")}
            >
              <div className="flex items-start gap-2">
                {isCorrect
                  ? <CheckCircle className="size-4 text-success shrink-0 mt-0.5" aria-hidden />
                  : isSelected
                    ? <XCircle className="size-4 text-destructive shrink-0 mt-0.5" aria-hidden />
                    : <MinusCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                }
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={cn(
                    "font-medium leading-snug",
                    isCorrect && "text-success",
                    isSelected && !isCorrect && "text-destructive"
                  )}>
                    <span className="font-bold">{opcion.letra}.</span>{" "}
                    <MathText text={opcion.texto} />
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    <MathText text={opcion.explicacion} />
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
