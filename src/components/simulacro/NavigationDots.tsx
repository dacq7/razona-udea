"use client"
import { cn } from "@/lib/utils"

interface Props {
  total: number
  actual: number // 0-indexed
  respondidas: boolean[] // index i = true means question i has been answered
  onJump: (index: number) => void
}

interface DotProps {
  index: number
  actual: number
  respondida: boolean
  onJump: (index: number) => void
}

function Dot({ index, actual, respondida, onJump }: DotProps) {
  const isCurrent = index === actual
  return (
    <button
      onClick={() => onJump(index)}
      aria-label={`Pregunta ${index + 1}`}
      aria-current={isCurrent ? 'true' : undefined}
      className={cn(
        "size-8 shrink-0 rounded-md text-xs font-medium transition-colors",
        "flex items-center justify-center",
        isCurrent && "ring-2 ring-primary ring-offset-1 bg-primary/20 text-foreground",
        !isCurrent && respondida && "bg-primary text-primary-foreground hover:bg-primary/80",
        !isCurrent && !respondida && "bg-muted text-muted-foreground border border-border hover:bg-accent/40"
      )}
    >
      {index + 1}
    </button>
  )
}

export function NavigationDots({ total, actual, respondidas, onJump }: Props) {
  const dots = Array.from({ length: total }, (_, i) => (
    <Dot
      key={i}
      index={i}
      actual={actual}
      respondida={respondidas[i] ?? false}
      onJump={onJump}
    />
  ))

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden overflow-x-auto pb-1">
        <div className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
          {dots}
        </div>
      </div>

      {/* Desktop: 10-column grid */}
      <div className="hidden lg:grid grid-cols-10 gap-1.5">
        {dots}
      </div>
    </>
  )
}
