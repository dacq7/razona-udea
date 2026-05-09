import { notFound } from "next/navigation"
import Link from "next/link"
import { getModuleMeta, getEjemplos } from "@/lib/content"
import { MODULES } from "@/lib/modules"
import { EjercicioCard } from "@/components/ejercicios/EjercicioCard"
import { MarkStageAsCompleted } from "@/components/ejercicios/MarkStageAsCompleted"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }))
}

export default async function EjemplosPage({ params }: Props) {
  const { slug } = await params

  if (!MODULES.some((m) => m.slug === slug)) notFound()

  const [meta, ejemplos] = await Promise.all([
    getModuleMeta(slug),
    getEjemplos(slug),
  ])

  return (
    <article className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/modulos" className="hover:text-foreground transition-colors">Módulos</Link>
        <span>/</span>
        <Link
          href={`/modulos/${slug}`}
          className="hover:text-foreground transition-colors truncate max-w-[160px]"
        >
          {meta.titulo}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Ejemplos</span>
      </nav>

      {/* Header */}
      <h1 className="text-2xl font-bold leading-tight">
        Ejemplos resueltos: {meta.titulo}
      </h1>

      {/* Content */}
      {ejemplos.length === 0 ? (
        <p className="text-muted-foreground italic">
          Contenido en desarrollo. ¡Vuelve pronto!
        </p>
      ) : (
        <div className="space-y-6">
          {ejemplos.map((ejemplo, i) => (
            <EjercicioCard key={ejemplo.id} ejemplo={ejemplo} index={i} />
          ))}
        </div>
      )}

      {/* Mark as completed */}
      <div className="pt-4 border-t">
        <MarkStageAsCompleted slug={slug} etapa="ejemplos" />
      </div>
    </article>
  )
}
