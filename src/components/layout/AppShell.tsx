import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { Toaster } from "@/components/ui/sonner"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
