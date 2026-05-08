import type { ModuleMeta } from "@/types"

export const MODULES: ModuleMeta[] = [
  {
    slug: 'logica-proposicional',
    titulo: 'Lógica Proposicional y Conjuntos',
    descripcion: 'Conectivos lógicos, tablas de verdad y operaciones entre conjuntos. La base del razonamiento formal.',
    icono: 'GitBranch',
    orden_recomendado: 1,
    color: 'teal',
  },
  {
    slug: 'aritmetica',
    titulo: 'Aritmética y Operaciones',
    descripcion: 'Operaciones fundamentales, divisibilidad, potencias y raíces. El núcleo del cálculo numérico.',
    icono: 'Calculator',
    orden_recomendado: 2,
    color: 'blue',
  },
  {
    slug: 'proporcionalidad',
    titulo: 'Proporcionalidad y Porcentajes',
    descripcion: 'Razones, proporciones, regla de tres y cálculo de porcentajes en contextos reales.',
    icono: 'Percent',
    orden_recomendado: 3,
    color: 'violet',
  },
  {
    slug: 'tablas-graficas',
    titulo: 'Análisis de Tablas y Gráficas',
    descripcion: 'Lectura e interpretación de datos presentados en tablas, gráficos de barras, líneas y torta.',
    icono: 'BarChart2',
    orden_recomendado: 4,
    color: 'amber',
  },
  {
    slug: 'geometria-espacial',
    titulo: 'Razonamiento Geométrico y Espacial',
    descripcion: 'Figuras planas, sólidos, perímetros, áreas y visualización espacial.',
    icono: 'Shapes',
    orden_recomendado: 5,
    color: 'rose',
  },
  {
    slug: 'series-secuencias',
    titulo: 'Series y Secuencias',
    descripcion: 'Identificación de patrones numéricos, figurativos y alfanuméricos en series.',
    icono: 'TrendingUp',
    orden_recomendado: 6,
    color: 'green',
  },
  {
    slug: 'control-variables',
    titulo: 'Control de Variables y Combinatoria',
    descripcion: 'Principios de conteo, permutaciones, combinaciones y control experimental.',
    icono: 'Shuffle',
    orden_recomendado: 7,
    color: 'orange',
  },
  {
    slug: 'procesos-fisicos',
    titulo: 'Procesos Físicos',
    descripcion: 'Interpretación de fenómenos físicos mediante gráficas y razonamiento cuantitativo.',
    icono: 'Zap',
    orden_recomendado: 8,
    color: 'cyan',
  },
]

export function getModuleBySlug(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug)
}
