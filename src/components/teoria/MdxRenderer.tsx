import { MDXRemote } from "next-mdx-remote/rsc"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import type { ComponentPropsWithoutRef } from "react"

const components = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-xl font-semibold mt-6 mb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-semibold mt-4 mb-2" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-3 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-6 mb-3 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1" {...props}>{children}</ol>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-border text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-muted" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th className="border border-border px-3 py-2 text-left font-medium" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className="border border-border px-3 py-2" {...props}>{children}</td>
  ),
  code: ({ children, ...props }: ComponentPropsWithoutRef<"code">) => (
    <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono" {...props}>{children}</code>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props}>{children}</strong>
  ),
}

export async function MdxRenderer({ source }: { source: string }) {
  if (!source) {
    return (
      <p className="text-muted-foreground italic">
        Contenido en desarrollo. ¡Vuelve pronto!
      </p>
    )
  }

  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath, remarkGfm],
          rehypePlugins: [rehypeKatex],
        },
      }}
      components={components}
    />
  )
}
