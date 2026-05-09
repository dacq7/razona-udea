import Link from "next/link"

export default function ResultadosPage() {
  return (
    <article className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/simulacro-final" className="hover:text-foreground transition-colors">Simulacro Final</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Resultados</span>
      </nav>
      <h1 className="text-2xl font-bold leading-tight">Resultados del Simulacro</h1>
      <p className="text-muted-foreground italic">
        Contenido en desarrollo — Paso 12. ¡Vuelve pronto!
      </p>
    </article>
  )
}
