"use client"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { MathText } from "./MathText"

interface Props {
  pista: string
  revelada: boolean
  onReveal: () => void
}

export function PistaButton({ pista, revelada, onReveal }: Props) {
  if (revelada) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
        <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
        <MathText text={pista} className="text-amber-700 dark:text-amber-300 leading-snug" />
      </div>
    )
  }

  return (
    <button
      onClick={onReveal}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
        "text-muted-foreground border border-border",
        "hover:bg-accent/50 hover:border-amber-500/50 hover:text-foreground",
        "transition-colors min-h-[44px]"
      )}
    >
      <Lightbulb className="size-4" aria-hidden />
      Ver pista
    </button>
  )
}
