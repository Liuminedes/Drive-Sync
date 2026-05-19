import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalogo/product-card'
import { AdvisorCard } from '@/components/catalogo/advisor-card'

export const dynamic = 'force-dynamic'

// Por simplicidad en este demo, tomamos el primer tenant.
// En producción, esto se obtendría del subdominio o middleware.
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export default async function CatalogoPage() {
  const supabase = await createClient()
  
  const { data: productos, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_fotos (url, es_portada)
    `)
    .eq('tenant_id', DEMO_TENANT_ID)
    .eq('estado', 'DISPONIBLE')
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos:', error)
    return <div className="p-8 text-center text-red-500">Error cargando el catálogo</div>
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background selection:bg-primary/30">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg tracking-tighter">D</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">DriveSync</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm font-medium bg-muted/50 text-muted-foreground px-2.5 sm:px-3 py-1 rounded-full border border-border/50 whitespace-nowrap">
              {productos?.length} vehículos
            </span>
          </div>
        </div>
      </header>
      
      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">

        {/* Hero title */}
        <div className="mb-8 sm:mb-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
            Descubre tu próximo vehículo
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Explora nuestro inventario seleccionado de vehículos certificados, listos para que los conduzcas hoy mismo.
          </p>
        </div>

        {/* Tarjeta de presentación del asesor */}
        <AdvisorCard />

        {/* Grid de productos */}
        {productos?.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-white dark:bg-muted/10 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">No hay vehículos disponibles</h3>
            <p className="text-muted-foreground mt-2">Vuelve a revisar más tarde para ver nuestras novedades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {productos?.map(producto => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
