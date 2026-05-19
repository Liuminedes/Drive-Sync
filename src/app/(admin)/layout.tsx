import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileHeader } from '@/components/dashboard/mobile-header'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
      En desktop (lg+): sidebar ocupa espacio en el flow normal → flex row.
      En móvil:         sidebar NO ocupa espacio → el drawer se pone fixed por encima.
      El div wrapper sigue siendo flex pero el Sidebar en móvil está hidden, 
      así el contenido principal ocupa el 100% del ancho.
    */
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-background selection:bg-primary/30">
      {/* Sidebar desktop — solo visible lg+, no existe en el DOM móvil gracias a hidden lg:flex */}
      <Sidebar />

      {/* Columna principal — ocupa todo en móvil, el resto en desktop */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* MobileHeader gestiona el botón hamburger + drawer fixed (no afecta layout) */}
        <MobileHeader />

        {/* Header desktop */}
        <header className="hidden lg:flex h-16 border-b border-border/40 bg-white/50 dark:bg-background/50 backdrop-blur-md items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="text-sm font-medium text-muted-foreground">Panel de Control / Vista General</h2>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="h-8 shadow-sm">Soporte</Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
