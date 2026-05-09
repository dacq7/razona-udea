import { MathText } from "./MathText"
import type { EjemplosResuelto } from "@/types"

interface Props {
  ejemplo: EjemplosResuelto
  index: number
}

export function EjercicioCard({ ejemplo, index }: Props) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      {/* Number badge + label */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
          {index + 1}
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ejemplo {index + 1}
        </span>
      </div>

      {/* Enunciado */}
      <p className="font-medium text-sm leading-relaxed">
        <MathText text={ejemplo.enunciado} />
      </p>

      {/* Pasos */}
      <ol className="list-decimal pl-5 space-y-2 text-sm">
        {ejemplo.pasos.map((paso, i) => (
          <li key={i} className="leading-relaxed">
            <MathText text={paso} />
          </li>
        ))}
      </ol>

      {/* Conclusión */}
      <div className="border-l-4 border-primary bg-accent/50 rounded-r-md px-4 py-3">
        <p className="text-sm font-medium">
          <MathText text={ejemplo.conclusion} />
        </p>
      </div>
    </div>
  )
}
