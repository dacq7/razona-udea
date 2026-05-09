import { notFound } from "next/navigation"
import Link from "next/link"
import { getModuleMeta } from "@/lib/content"
import { getLucideIcon } from "@/lib/icons"
import { getColorClasses } from "@/lib/colors"
import { MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { StageSelector } from "@/components/modulos/StageSelector"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }))
}

export default async function ModuloPage({ params }: Props) {
  const { slug } = await params

  if (!MODULES.some((m) => m.slug === slug)) notFound()

  const meta = await getModuleMeta(slug)
  const Icon = getLucideIcon(meta.icono)
  const colorClasses = getColorClasses(meta.color)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/modulos" className="hover:text-foreground transition-colors">
          Módulos
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{meta.titulo}</span>
      </nav>

      {/* Module header */}
      <div className="flex items-start gap-4">
        <div className={cn("flex items-center justify-center size-16 rounded-xl shrink-0", colorClasses)}>
          <Icon className="size-8" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{meta.titulo}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{meta.descripcion}</p>
        </div>
      </div>

      {/* Stage selector */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Etapas de aprendizaje</h2>
        <StageSelector slug={slug} />
      </section>
    </div>
  )
}
