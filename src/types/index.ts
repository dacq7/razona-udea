// --- Contenido ---

export interface ModuleMeta {
  slug: string
  titulo: string
  descripcion: string
  icono: string          // nombre de lucide-react icon
  orden_recomendado: number
  color: 'teal' | 'blue' | 'violet' | 'amber' | 'rose' | 'green' | 'orange' | 'cyan'
}

export interface Opcion {
  letra: 'A' | 'B' | 'C' | 'D'
  texto: string
  es_correcta: boolean
  explicacion: string    // Por qué esta opción es correcta O por qué es trampa
}

export interface EjercicioPractica {
  id: string
  enunciado: string
  pista: string          // Orienta el método, no revela la respuesta
  opciones: Opcion[]     // Exactamente 4, solo una con es_correcta: true
  dificultad: 1 | 2 | 3 // Escalonado dentro del módulo
}

export interface EjemplosResuelto {
  id: string
  enunciado: string
  pasos: string[]        // Array de strings (pueden tener notación KaTeX $...$)
  conclusion: string
}

export interface EjercicioSimulacro {
  id: string
  modulo_slug: string    // Para desglose en simulacro final
  enunciado: string
  opciones: Opcion[]     // Solo texto + es_correcta. Sin explicacion visible durante simulacro
}

// --- Progreso (localStorage) ---

export type EtapaEstado = 'no_iniciada' | 'en_progreso' | 'completada'

export interface ModuloProgreso {
  slug: string
  teoria: EtapaEstado
  ejemplos: EtapaEstado
  practica: {
    estado: EtapaEstado
    aciertos: number    // De 5
    intentos: number    // Cuántas veces hizo la práctica
  }
  simulacro: {
    estado: EtapaEstado
    aciertos: number    // De 5
    intentos: number
    tiempo_promedio_segundos: number
  }
}

export interface ProgressStore {
  version: number                          // Para migraciones futuras
  modulos: Record<string, ModuloProgreso>  // keyed por slug
  tiempo_total_segundos: number
  ultima_actividad: string                 // ISO date
}

export interface SimulacroFinalResult {
  id: string            // timestamp como string
  fecha: string         // ISO date
  puntaje_total: number // De 40
  tiempo_usado_segundos: number
  respuestas: Array<{
    ejercicio_id: string
    modulo_slug: string
    respuesta_elegida: 'A' | 'B' | 'C' | 'D' | null  // null = no respondida
    es_correcta: boolean
  }>
  puntaje_por_modulo: Record<string, { correctas: number; total: number }>
}

export interface SimulacroFinalStore {
  historial: SimulacroFinalResult[]  // Últimos 10 resultados
}

// --- Estado del simulacro en curso (para recuperación tras recarga) ---
export interface SimulacroEnCurso {
  inicio_timestamp: number     // Date.now()
  duracion_segundos: number    // 5400 para final, 300 para módulo
  preguntas_ids: string[]      // IDs en orden shuffled
  respuestas: Record<string, 'A' | 'B' | 'C' | 'D'>
  modulo_slug?: string         // undefined = simulacro final
}
