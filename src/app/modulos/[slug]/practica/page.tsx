import { notFound } from "next/navigation"
import Link from "next/link"
import { getModuleMeta, getPractica } from "@/lib/content"
import { MODULES } from "@/lib/modules"
import { PracticaController } from "@/components/ejercicios/PracticaController"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }))
}

export default async function PracticaPage({ params }: Props) {
  const { slug } = await params

  if (!MODULES.some((m) => m.slug === slug)) notFound()

  const [meta, ejercicios] = await Promise.all([
    getModuleMeta(slug),
    getPractica(slug),
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
        <span className="text-foreground font-medium">Práctica</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight">Práctica: {meta.titulo}</h1>

      {ejercicios.length === 0 ? (
        <p className="text-muted-foreground italic">
          Contenido en desarrollo. ¡Vuelve pronto!
        </p>
      ) : (
        <PracticaController slug={slug} ejercicios={ejercicios} />
      )}
    </article>
  )
}
