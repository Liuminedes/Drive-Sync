'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, Users, Settings, MapPin, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Car },
  { href: '/dashboard/leads', label: 'Leads (CRM)', icon: Users },
  { href: '/dashboard/usuarios', label: 'Usuarios y Roles', icon: Settings },
  { href: '/dashboard/sedes', label: 'Sedes y Ubicaciones', icon: MapPin },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Top bar — solo visible en móvil (< lg) */}
      <header className="lg:hidden h-14 border-b border-border/40 bg-white/80 dark:bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
          </div>
          <span className="font-semibold tracking-tight">DriveSync</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs shadow-sm">
            Soporte
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-background border-r border-border/40 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del drawer */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
            </div>
            <span className="font-semibold tracking-tight">DriveSync</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-foreground bg-muted/80 shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none">Mi Cuenta</span>
              <span className="text-xs text-muted-foreground mt-1 truncate">Admin / Asesor</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={async () => {
              const { logout } = await import('@/actions/auth')
              await logout()
              window.location.href = '/login'
            }}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  )
}
