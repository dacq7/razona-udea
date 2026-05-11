import 'server-only'
import fs from 'fs'
import path from 'path'
import type { ModuleMeta, EjemplosResuelto, EjercicioPractica, EjercicioSimulacro } from "@/types"
import { MODULES } from "@/lib/modules"

const CONTENT_DIR = path.join(process.cwd(), 'content/modulos')

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function getModuleMeta(slug: string): Promise<ModuleMeta> {
  const data = readJson<ModuleMeta>(path.join(CONTENT_DIR, slug, 'meta.json'))
  if (!data) {
    // Fallback to static registry if file doesn't exist yet
    const fromRegistry = MODULES.find((m) => m.slug === slug)
    if (!fromRegistry) throw new Error(`Module not found: ${slug}`)
    return fromRegistry
  }
  return data
}

export async function getEjemplos(slug: string): Promise<EjemplosResuelto[]> {
  return readJson<EjemplosResuelto[]>(path.join(CONTENT_DIR, slug, 'ejemplos.json')) ?? []
}

export async function getPractica(slug: string): Promise<EjercicioPractica[]> {
  return readJson<EjercicioPractica[]>(path.join(CONTENT_DIR, slug, 'practica.json')) ?? []
}

export async function getSimulacro(slug: string): Promise<EjercicioSimulacro[]> {
  return readJson<EjercicioSimulacro[]>(path.join(CONTENT_DIR, slug, 'simulacro.json')) ?? []
}

export async function getTeorias(slug: string): Promise<{ standard: string; simple: string }> {
  const teoriaPath = path.join(CONTENT_DIR, slug, 'teoria.mdx')
  const simplePath = path.join(CONTENT_DIR, slug, 'teoria-simple.mdx')
  let standard = ''
  let simple = ''
  try { standard = fs.readFileSync(teoriaPath, 'utf8') } catch { /* file not yet created */ }
  try { simple = fs.readFileSync(simplePath, 'utf8') } catch { /* file not yet created */ }
  return { standard, simple }
}

export async function getAllSimulacroEjercicios(): Promise<EjercicioSimulacro[]> {
  const all: EjercicioSimulacro[] = []
  for (const modulo of MODULES) {
    const ejercicios = await getSimulacro(modulo.slug)
    // Ensure modulo_slug is set correctly even if the JSON was written without it
    for (const ej of ejercicios) {
      all.push({ ...ej, modulo_slug: modulo.slug })
    }
  }
  return all
}

export async function getSimulacroEjerciciosPorModulo(): Promise<Record<string, EjercicioSimulacro[]>> {
  const map: Record<string, EjercicioSimulacro[]> = {}
  for (const modulo of MODULES) {
    const ejercicios = await getSimulacro(modulo.slug)
    map[modulo.slug] = ejercicios.map((e) => ({ ...e, modulo_slug: modulo.slug }))
  }
  return map
}
