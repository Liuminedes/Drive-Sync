'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, Users, Settings, MapPin, Star, Package, UserCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const navItems = [
  { href: '/dashboard',             label: 'Dashboard',          icon: LayoutDashboard, exact: true },
  { href: '/dashboard/inventario',  label: 'Inventario',         icon: Car },
  { href: '/dashboard/leads',       label: 'Leads (CRM)',        icon: Users },
  { href: '/dashboard/resenas',     label: 'Reseñas',            icon: Star },
  { href: '/dashboard/entregas',    label: 'Entregas',           icon: Package },
  { href: '/dashboard/usuarios',    label: 'Usuarios y Roles',   icon: Settings, roles: ['ADMIN', 'SUPERADMIN'] },
  { href: '/dashboard/sedes',       label: 'Sedes y Ubicaciones',icon: MapPin, roles: ['ADMIN', 'SUPERADMIN'] },
  { href: '/dashboard/perfil',      label: 'Mi Perfil',          icon: UserCircle },
  { href: '/dashboard/superadmin',  label: 'SuperAdmin SaaS',    icon: ShieldCheck, roles: ['SUPERADMIN'] },
]

export const navFor = (role: string) => navItems.filter((i) => !('roles' in i) || (i as any).roles.includes(role))

export function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex w-64 border-r border-border/40 bg-white dark:bg-background flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3 shadow-sm">
          <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
        </div>
        <span className="font-semibold tracking-tight text-lg">DriveSync</span>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {navFor(role).map((item) => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const isSuperAdmin = item.href === '/dashboard/superadmin'
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'text-foreground bg-muted/80 shadow-sm border border-border/50' 
                  : isSuperAdmin
                  ? 'text-primary hover:bg-primary/5 hover:text-primary font-semibold border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border/40 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{name.slice(0, 2).toUpperCase()}</div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium leading-none truncate">{name}</span>
            <span className="text-xs text-muted-foreground mt-1 truncate">{role}</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={async () => { const { logout } = await import('@/actions/auth'); await logout(); window.location.href = '/login' }}>
          Cerrar Sesión
        </Button>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-muted-foreground font-medium">Powered by</p>
          <a href="https://vyntraorbit.com" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold tracking-tight text-primary hover:underline">Vyntra Orbit</a>
        </div>
      </div>
    </aside>
  )
}
