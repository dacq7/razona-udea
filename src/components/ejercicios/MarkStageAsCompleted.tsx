"use client"
import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProgress, updateModuloEtapa } from "@/lib/storage"

export type SimpleEtapa = "teoria" | "ejemplos"

const BUTTON_LABELS: Record<SimpleEtapa, string> = {
  teoria:   "Entendido, continuar",
  ejemplos: "He revisado los ejemplos",
}

const DONE_LABELS: Record<SimpleEtapa, string> = {
  teoria:   "Teoría completada",
  ejemplos: "Ejemplos completados",
}

interface Props {
  slug: string
  etapa: SimpleEtapa
}

export function MarkStageAsCompleted({ slug, etapa }: Props) {
  const [completed, setCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    setCompleted(progress.modulos[slug]?.[etapa] === "completada")
    setMounted(true)
  }, [slug, etapa])

  function handleClick() {
    updateModuloEtapa(slug, etapa, "completada")
    setCompleted(true)
  }

  if (!mounted) {
    return <div className="h-11 w-52 bg-muted animate-pulse rounded-md" />
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-success font-medium py-2">
        <CheckCircle className="size-5" />
        {DONE_LABELS[etapa]}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "transition-colors min-h-[44px]"
      )}
    >
      {BUTTON_LABELS[etapa]}
    </button>
  )
}
