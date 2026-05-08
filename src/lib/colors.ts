import type { ModuleMeta } from "@/types"

const colorMap: Record<ModuleMeta['color'], string> = {
  teal:   'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  blue:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose:   'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  green:  'bg-green-500/10 text-green-600 dark:text-green-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  cyan:   'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}

export function getColorClasses(color: ModuleMeta['color']): string {
  return colorMap[color]
}
