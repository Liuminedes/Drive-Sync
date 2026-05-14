'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, Users, Settings, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Car },
  { href: '/dashboard/leads', label: 'Leads (CRM)', icon: Users },
  { href: '/dashboard/usuarios', label: 'Usuarios y Roles', icon: Settings },
  { href: '/dashboard/sedes', label: 'Sedes y Ubicaciones', icon: MapPin },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border/40 bg-white dark:bg-background flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3 shadow-sm">
          <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
        </div>
        <span className="font-semibold tracking-tight text-lg">DriveSync</span>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href)

          return (
            <Link 
              key={item.href} 
              href={item.href} 
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
      <div className="p-4 border-t border-border/40 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            AD
          </div>
          <div className="flex flex-col">
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
    </aside>
  )
}
