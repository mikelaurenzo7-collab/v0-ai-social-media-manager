import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { TopBar } from '@/components/dashboard/top-bar'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { ShortcutsOverlay } from '@/components/dashboard/shortcuts-overlay'
import { CopilotDrawer } from '@/components/dashboard/copilot-drawer'
import { CrisisBanner } from '@/components/dashboard/crisis-mode'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Crisis banner (renders only when armed) — full width above everything */}
      <CrisisBanner />

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile Navigation */}
          <MobileNav />

          {/* Desktop Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="relative flex-1 overflow-auto">
            {/* Subtle warm radial in top-right — gives the canvas depth */}
            <div
              className="pointer-events-none fixed top-0 right-0 h-[600px] w-[600px] opacity-40"
              style={{
                background: 'radial-gradient(circle at top right, oklch(0.652 0.214 36 / 0.07), transparent 65%)',
                zIndex: 0,
              }}
            />
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>

      {/* Global ⌘K palette + ? shortcuts overlay + ⌘J Co-Pilot */}
      <CommandPalette />
      <ShortcutsOverlay />
      <CopilotDrawer />
    </div>
  )
}
