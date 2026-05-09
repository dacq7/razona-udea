"use client"
import katex from "katex"
import { useMemo } from "react"

export function MathText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => {
    // Process $$...$$ (display math) before $...$ to avoid partial matches
    return text
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, formula: string) => {
        try {
          return katex.renderToString(formula.trim(), {
            throwOnError: false,
            displayMode: true,
            output: "html",
          })
        } catch {
          return `<code>${formula}</code>`
        }
      })
      .replace(/\$([^$\n]+)\$/g, (_, formula: string) => {
        try {
          return katex.renderToString(formula, { throwOnError: false, output: "html" })
        } catch {
          return `<code>${formula}</code>`
        }
      })
  }, [text])

  // dangerouslySetInnerHTML is safe here: content comes from ejemplos.json
  // in the repository, never from user input. (See blueprint §9 Paso 8)
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
