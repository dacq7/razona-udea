"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Must use useState+useEffect (not resolvedTheme check) because next-themes sets
  // resolvedTheme synchronously via an inline script before React hydrates,
  // causing a hydration mismatch if we render the button on client but div on server.
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 min-h-[44px] rounded-md",
          className
        )}
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        "transition-colors min-h-[44px]",
        className
      )}
    >
      {isDark ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />}
      {isDark ? "Modo claro" : "Modo oscuro"}
    </button>
  )
}
