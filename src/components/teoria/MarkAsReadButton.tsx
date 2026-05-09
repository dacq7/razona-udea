"use client"
import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProgress, updateModuloEtapa } from "@/lib/storage"

export function MarkAsReadButton({ slug }: { slug: string }) {
  const [completed, setCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    setCompleted(progress.modulos[slug]?.teoria === "completada")
    setMounted(true)
  }, [slug])

  function handleClick() {
    updateModuloEtapa(slug, "teoria", "completada")
    setCompleted(true)
  }

  // Invisible placeholder until mounted to avoid CLS
  if (!mounted) {
    return <div className="h-11 w-48 bg-muted animate-pulse rounded-md" />
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-success font-medium py-2">
        <CheckCircle className="size-5" />
        Teoría completada
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
      Entendido, continuar
    </button>
  )
}
