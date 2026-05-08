import type {
  ProgressStore,
  ModuloProgreso,
  SimulacroFinalStore,
  SimulacroFinalResult,
  SimulacroEnCurso,
} from "@/types"
import { formatTime } from "@/lib/utils"

const SLUGS = [
  'logica-proposicional',
  'aritmetica',
  'proporcionalidad',
  'tablas-graficas',
  'geometria-espacial',
  'series-secuencias',
  'control-variables',
  'procesos-fisicos',
] as const

const KEYS = {
  progress: 'razona_progress',
  simulacros: 'razona_simulacros',
  simulacroEnCurso: 'razona_simulacro_en_curso',
} as const

function emptyModuloProgreso(slug: string): ModuloProgreso {
  return {
    slug,
    teoria: 'no_iniciada',
    ejemplos: 'no_iniciada',
    practica: { estado: 'no_iniciada', aciertos: 0, intentos: 0 },
    simulacro: { estado: 'no_iniciada', aciertos: 0, intentos: 0, tiempo_promedio_segundos: 0 },
  }
}

function emptyProgress(): ProgressStore {
  const modulos: Record<string, ModuloProgreso> = {}
  for (const slug of SLUGS) {
    modulos[slug] = emptyModuloProgreso(slug)
  }
  return {
    version: 1,
    modulos,
    tiempo_total_segundos: 0,
    ultima_actividad: new Date().toISOString(),
  }
}

export function getProgress(): ProgressStore {
  if (typeof window === 'undefined') return emptyProgress()
  try {
    const raw = localStorage.getItem(KEYS.progress)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as ProgressStore
    // Ensure all 8 module slugs exist (guard against partial stores from older versions)
    for (const slug of SLUGS) {
      if (!parsed.modulos[slug]) {
        parsed.modulos[slug] = emptyModuloProgreso(slug)
      }
    }
    return parsed
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: ProgressStore): void {
  if (typeof window === 'undefined') return
  try {
    progress.ultima_actividad = new Date().toISOString()
    localStorage.setItem(KEYS.progress, JSON.stringify(progress))
  } catch {
    // localStorage can be full or blocked in private mode — fail silently
  }
}

export function updateModuloEtapa(
  slug: string,
  etapa: keyof Omit<ModuloProgreso, 'slug'>,
  valor: ModuloProgreso[keyof Omit<ModuloProgreso, 'slug'>]
): void {
  const progress = getProgress()
  if (!progress.modulos[slug]) {
    progress.modulos[slug] = emptyModuloProgreso(slug)
  }
  progress.modulos[slug] = { ...progress.modulos[slug], [etapa]: valor } as ModuloProgreso
  saveProgress(progress)
}

export function getSimulacros(): SimulacroFinalStore {
  if (typeof window === 'undefined') return { historial: [] }
  try {
    const raw = localStorage.getItem(KEYS.simulacros)
    if (!raw) return { historial: [] }
    return JSON.parse(raw) as SimulacroFinalStore
  } catch {
    return { historial: [] }
  }
}

export function saveSimulacroResult(result: SimulacroFinalResult): void {
  if (typeof window === 'undefined') return
  try {
    const store = getSimulacros()
    store.historial.unshift(result)
    if (store.historial.length > 10) {
      store.historial = store.historial.slice(0, 10)
    }
    localStorage.setItem(KEYS.simulacros, JSON.stringify(store))
  } catch {
    // fail silently
  }
}

export function getSimulacroEnCurso(): SimulacroEnCurso | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.simulacroEnCurso)
    if (!raw) return null
    return JSON.parse(raw) as SimulacroEnCurso
  } catch {
    return null
  }
}

export function saveSimulacroEnCurso(s: SimulacroEnCurso): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEYS.simulacroEnCurso, JSON.stringify(s))
  } catch {
    // fail silently
  }
}

export function clearSimulacroEnCurso(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEYS.simulacroEnCurso)
  } catch {
    // fail silently
  }
}

export function calcularEstadisticasGlobales(): {
  modulos_completados: number
  aciertos_totales: number
  tiempo_total: string
} {
  const progress = getProgress()
  let modulos_completados = 0
  let aciertos_totales = 0

  for (const modulo of Object.values(progress.modulos)) {
    const etapasCompletadas =
      (modulo.teoria === 'completada' ? 1 : 0) +
      (modulo.ejemplos === 'completada' ? 1 : 0) +
      (modulo.practica.estado === 'completada' ? 1 : 0) +
      (modulo.simulacro.estado === 'completada' ? 1 : 0)
    if (etapasCompletadas === 4) modulos_completados++
    aciertos_totales += modulo.practica.aciertos + modulo.simulacro.aciertos
  }

  return {
    modulos_completados,
    aciertos_totales,
    tiempo_total: formatTime(progress.tiempo_total_segundos),
  }
}
