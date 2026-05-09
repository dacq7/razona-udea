import * as LucideIcons from "lucide-react"

export function getLucideIcon(name: string): React.ElementType {
  return (LucideIcons as unknown as Record<string, React.ElementType>)[name]
    ?? LucideIcons.BookOpen
}
