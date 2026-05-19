import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalogo/product-card'
import { AdvisorCard } from '@/components/catalogo/advisor-card'
import { ResenasSectionPublic } from '@/components/resenas/resenas-section-public'
import { EntregasSectionPublic } from '@/components/entregas/entregas-section-public'
import { VehicleDeepLink } from '@/components/catalogo/vehicle-deep-link'

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
    supabase
      .from('resenas')
      .select('*')
      .eq('tenant_id', DEMO_TENANT_ID)
      .eq('visible', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('entregas')
      .select('*')
      .eq('tenant_id', DEMO_TENANT_ID)
      .eq('visible', true)
      .order('fecha_entrega', { ascending: false }),
  ])

  const productos = productosRes.data ?? []
  const resenas   = resenasRes.data ?? []
  const entregas  = entregasRes.data ?? []

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background">
      {/* ── Header ── */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">DriveSync</h1>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <a href="#catalogo" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Catálogo</a>
              <a href="#resenas"  className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Reseñas</a>
              <a href="#entregas" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors">Entregas</a>
            </nav>
            <span className="text-xs sm:text-sm font-medium bg-muted/50 text-muted-foreground px-2.5 sm:px-3 py-1 rounded-full border border-border/50 whitespace-nowrap">
              {productos.length} vehículos
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main>
        {/* Hero + Catálogo */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
              Descubre tu próximo vehículo
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Inventario seleccionado de vehículos certificados, listos para conducir hoy mismo.
            </p>
          </div>

          {/* Tarjeta del asesor */}
          <AdvisorCard />

          {/* Grid de productos */}
          {productos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-muted/10 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">No hay vehículos disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {productos.map(producto => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          )}
        </section>

        {/* Reseñas */}
        {resenas.length > 0 && (
          <section id="resenas" className="border-t border-border/40 bg-white dark:bg-muted/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
              <ResenasSectionPublic resenas={resenas} />
            </div>
          </section>
        )}

        {/* Entregas */}
        {entregas.length > 0 && (
          <section id="entregas" className="border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
              <EntregasSectionPublic entregas={entregas} />
            </div>
          </section>
        )}
      </main>

      {/* Deep-link: abre modal de un vehículo específico si la URL tiene ?v=ID */}
      <VehicleDeepLink productos={productos} />
    </div>
  )
}
