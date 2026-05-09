import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getTeorias, getModuleMeta } from "@/lib/content"
import { MODULES } from "@/lib/modules"
import { MdxRenderer } from "@/components/teoria/MdxRenderer"
import { ModoToggle } from "@/components/teoria/ModoToggle"
import { MarkAsReadButton } from "@/components/teoria/MarkAsReadButton"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ simple?: string }>
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }))
}

export default async function TeoriaPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { simple } = await searchParams

  if (!MODULES.some((m) => m.slug === slug)) notFound()

  const [meta, teorias] = await Promise.all([
    getModuleMeta(slug),
    getTeorias(slug),
  ])

  const isSimple = simple === "1"
  const source = isSimple ? teorias.simple : teorias.standard

  return (
    <article className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/modulos" className="hover:text-foreground transition-colors">Módulos</Link>
        <span>/</span>
        <Link href={`/modulos/${slug}`} className="hover:text-foreground transition-colors truncate max-w-[160px]">
          {meta.titulo}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Teoría</span>
      </nav>

      {/* Header: title + toggle stacked on mobile, side-by-side on desktop */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold leading-tight">Teoría: {meta.titulo}</h1>
        {/* Suspense required because ModoToggle uses useSearchParams() */}
        <Suspense fallback={<div className="h-11 w-52 bg-muted animate-pulse rounded-md" />}>
          <ModoToggle />
        </Suspense>
      </header>

      {/* MDX content */}
      <div className="prose-content">
        <MdxRenderer source={source} />
      </div>

      {/* Mark as read */}
      <div className="pt-4 border-t">
        <MarkAsReadButton slug={slug} />
      </div>
    </article>
  )
}
