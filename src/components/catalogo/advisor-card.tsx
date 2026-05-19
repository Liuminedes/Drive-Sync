import { createClient } from '@/lib/supabase/server'
import { Phone, MessageCircle, Star } from 'lucide-react'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export async function AdvisorCard() {
  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from('perfil_asesor')
    .select('*')
    .eq('tenant_id', DEMO_TENANT_ID)
    .single()

  // Si no hay perfil configurado aún, no renderiza nada
  if (!perfil?.nombre) return null

  const waLink = perfil.telefono
    ? `https://wa.me/${perfil.telefono.replace(/\D/g, '')}?text=¡Hola ${perfil.nombre.split(' ')[0]}! 😊 Vi tu catálogo en DriveSync y me gustaría más información.`
    : '#'

  return (
    <div className="mb-10 w-full">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-white/10">

        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 p-6 sm:p-8">

          {/* Avatar circular */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-md opacity-40 scale-110" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl bg-gray-700">
                {perfil.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.foto_url} alt={perfil.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-4xl">
                    {perfil.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Badge verificado */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info central */}
          <div className="flex-1 flex flex-col justify-center text-center sm:text-left min-w-0">
            {/* Badge superior */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-cyan-400" />
                Asesor Certificado · DriveSync
              </span>
            </div>

            {/* Nombre */}
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              {perfil.nombre}
            </h3>

            {/* Cargo y concesionario */}
            {perfil.cargo && (
              <p className="text-sm text-cyan-400 font-semibold mt-0.5">{perfil.cargo}</p>
            )}
            {perfil.concesionario && (
              <p className="text-xs text-gray-400 mt-0.5">{perfil.concesionario}</p>
            )}

            {/* Frase */}
            {perfil.frase && (
              <p className="text-xs text-gray-300 italic mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 max-w-xs sm:max-w-none">
                "{perfil.frase}"
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              {perfil.anios_exp && (
                <>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-bold text-white leading-none">{perfil.anios_exp}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Experiencia</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                </>
              )}
              {perfil.ventas_realizadas && (
                <>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-bold text-white leading-none">{perfil.ventas_realizadas}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Ventas</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                </>
              )}
              {perfil.calificacion && (
                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold text-white leading-none">{perfil.calificacion}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Calificación</p>
                </div>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-3 flex-shrink-0">
            {perfil.telefono && (
              <a
                href={`tel:${perfil.telefono}`}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 transition-colors font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden md:inline">Llamar</span>
              </a>
            )}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white transition-colors font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>
    </div>
  )
}
