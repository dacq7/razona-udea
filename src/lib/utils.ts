import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Opcion } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function calcularPorcentaje(correctas: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correctas / total) * 100)
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function shuffleOpciones<T extends { opciones: Opcion[] }>(ejercicio: T): T {
  return { ...ejercicio, opciones: shuffle(ejercicio.opciones) }
}
