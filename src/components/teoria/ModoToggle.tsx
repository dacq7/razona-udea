"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModoToggle({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isSimple = searchParams.get("simple") === "1"

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (isSimple) {
      params.delete("simple")
    } else {
      params.set("simple", "1")
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shrink-0",
        "bg-secondary text-secondary-foreground hover:bg-accent transition-colors",
        "min-h-[44px]",
        className
      )}
    >
      <Sparkles className="size-4 shrink-0" />
      {isSimple ? "Explicación normal" : "Explicar como si tuviera 10"}
    </button>
  )
}
