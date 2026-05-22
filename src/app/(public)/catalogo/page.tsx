import { createClient } from '@/lib/supabase/server'
import { AdvisorCard } from '@/components/catalogo/advisor-card'
import { ResenasSectionPublic } from '@/components/resenas/resenas-section-public'
import { EntregasSectionPublic } from '@/components/entregas/entregas-section-public'
import { CatalogClientWrapper } from '@/components/catalogo/catalog-client-wrapper'

export const dynamic = 'force-dynamic'
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function CatalogoPage() {
  const supabase = await createClient()

  const [productosRes, resenasRes, entregasRes] = await Promise.all([
    supabase
      .from('productos')
      .select('*, producto_fotos (url, es_portada)')
      .eq('tenant_id', DEMO_TENANT_ID)
      .eq('estado', 'DISPONIBLE')
      .order('destacado', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('resenas').select('*').eq('tenant_id', DEMO_TENANT_ID).eq('visible', true).order('created_at', { ascending: false }),
    supabase.from('entregas').select('*').eq('tenant_id', DEMO_TENANT_ID).eq('visible', true).order('fecha_entrega', { ascending: false }),
  ])

  const productos = productosRes.data ?? []
  const resenas   = resenasRes.data ?? []
  const entregas  = entregasRes.data ?? []

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">DriveSync</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
            <a href="#catalogo" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Catálogo</a>
            {resenas.length > 0 && <a href="#resenas" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Reseñas</a>}
            {entregas.length > 0 && <a href="#entregas" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Entregas</a>}
          </nav>
        </div>
      </header>

      <main>
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
              Descubre tu próximo vehículo
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Inventario seleccionado de vehículos certificados, listos para conducir hoy mismo.
            </p>
          </div>

          <AdvisorCard />

          {/* Todo el catálogo con filtros y moneda es client-side */}
          <CatalogClientWrapper productos={productos} />
        </section>

        {resenas.length > 0 && (
          <section id="resenas" className="border-t border-border/40 bg-white dark:bg-muted/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
              <ResenasSectionPublic resenas={resenas} />
            </div>
          </section>
        )}

        {entregas.length > 0 && (
          <section id="entregas" className="border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
              <EntregasSectionPublic entregas={entregas} />
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border/40 bg-white/50 dark:bg-background/50 backdrop-blur-md py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p className="text-[13px] text-muted-foreground font-medium">
            Powered by <a href="https://vyntraorbit.com" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">Vyntra Orbit</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
