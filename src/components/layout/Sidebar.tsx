"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/modulos", label: "Módulos", icon: BookOpen },
  { href: "/simulacro-final", label: "Simulacro Final", icon: Trophy },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen border-r bg-background overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <span className="font-bold text-lg text-primary">Razona UdeA</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle pinned to bottom */}
      <div className="p-3 border-t">
        <ThemeToggle />
      </div>
    </aside>
  )
}
