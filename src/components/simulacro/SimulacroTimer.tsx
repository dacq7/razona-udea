"use client"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"

interface Props {
  inicioTimestamp: number
  duracionSegundos: number
  onTimeUp: () => void
  warningSeconds?: number
}

export function SimulacroTimer({
  inicioTimestamp,
  duracionSegundos,
  onTimeUp,
  warningSeconds = 60,
}: Props) {
  const [tiempoRestante, setTiempoRestante] = useState(() =>
    Math.max(0, duracionSegundos - Math.floor((Date.now() - inicioTimestamp) / 1000))
  )
  const timeUpFiredRef = useRef(false)
  const warningFiredRef = useRef(false)
  // Keep latest onTimeUp in a ref so the interval callback never goes stale
  // without needing it as a dep (which would reset the interval on every render)
  const onTimeUpRef = useRef(onTimeUp)
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - inicioTimestamp) / 1000)
      const remaining = Math.max(0, duracionSegundos - elapsed)
      setTiempoRestante(remaining)

      if (remaining <= warningSeconds && !warningFiredRef.current) {
        warningFiredRef.current = true
        toast.warning(`⏰ ¡Queda menos de ${formatTime(warningSeconds)}!`)
      }

      if (remaining === 0 && !timeUpFiredRef.current) {
        timeUpFiredRef.current = true
        clearInterval(interval)
        onTimeUpRef.current()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [inicioTimestamp, duracionSegundos, warningSeconds])

  const porcentaje = duracionSegundos > 0 ? (tiempoRestante / duracionSegundos) * 100 : 0

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
      <span className="text-xs text-muted-foreground">Tiempo:</span>
      <span
        className={cn(
          "font-mono text-lg tabular-nums font-semibold",
          porcentaje >= 50 && "text-muted-foreground",
          porcentaje >= 25 && porcentaje < 50 && "text-primary",
          porcentaje < 25 && "text-destructive"
        )}
      >
        {formatTime(tiempoRestante)}
      </span>
    </div>
  )
}
