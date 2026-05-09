import { cn } from "@/lib/utils"
import type { EtapaEstado } from "@/types"

interface Props {
  estado: EtapaEstado
  aciertos?: number
  total?: number
}

const estadoStyles: Record<EtapaEstado, string> = {
  no_iniciada: "bg-muted text-muted-foreground",
  en_progreso:  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  completada:   "bg-success/20 text-success",
}

const estadoLabels: Record<EtapaEstado, string> = {
  no_iniciada: "No iniciada",
  en_progreso:  "En progreso",
  completada:   "Completada",
}

export function ProgressBadge({ estado, aciertos, total }: Props) {
  const showScore = aciertos !== undefined && total !== undefined

  if (showScore) {
    const isFullScore = aciertos === total
    return (
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-full font-medium",
        isFullScore ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
      )}>
        {aciertos}/{total}
      </span>
    )
  }

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", estadoStyles[estado])}>
      {estadoLabels[estado]}
    </span>
  )
}
