"use client"
import { useEffect, useState } from "react"
import { CheckCircle, Target, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { calcularEstadisticasGlobales } from "@/lib/storage"

type Stats = {
  modulos_completados: number
  aciertos_totales: number
  tiempo_total: string
}

interface StatCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-3 md:p-4 flex flex-col items-center gap-1 text-center">
      <div className="mb-0.5">{icon}</div>
      <span className="text-xl md:text-3xl font-bold tabular-nums leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function SkeletonCard() {
  return <div className="rounded-lg bg-muted animate-pulse h-20 md:h-24" />
}

export function StatsRow() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    setStats(calcularEstadisticasGlobales())
  }, [])

  if (!stats) {
    return (
      <div className={cn("grid grid-cols-3 gap-2 md:gap-4")}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <StatCard
        icon={<CheckCircle className="size-4 md:size-5 text-success" />}
        value={stats.modulos_completados}
        label="Completados"
      />
      <StatCard
        icon={<Target className="size-4 md:size-5 text-primary" />}
        value={stats.aciertos_totales}
        label="Aciertos"
      />
      <StatCard
        icon={<Clock className="size-4 md:size-5 text-muted-foreground" />}
        value={stats.tiempo_total}
        label="Tiempo"
      />
    </div>
  )
}
