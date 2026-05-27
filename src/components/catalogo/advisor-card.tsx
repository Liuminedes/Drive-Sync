import { prisma } from '@/lib/prisma'
import { Phone, MessageCircle, Star, Building2 } from 'lucide-react'
import Image from 'next/image'

const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export async function AdvisorCard() {
  const perfil = await prisma.perfil_asesor.findUnique({
    where: { tenant_id: DEMO_TENANT_ID }
  })

  if (!perfil?.nombre) return null

  const waLink = perfil.telefono
    ? `https://wa.me/${perfil.telefono.replace(/\D/g, '')}?text=¡Hola ${perfil.nombre.split(' ')[0]}! 😊 Vi tu catálogo en DriveSync y me gustaría más información.`
    : '#'

  return (
    <div className="mb-10 w-full relative z-0">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-white/10 isolate">

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8">

          {/* ── 1. Avatar — más grande ── */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-lg opacity-50 scale-110" />
              {/* w-36 h-36 en mobile, w-40 h-40 en sm+ */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-[3px] border-white/25 shadow-2xl bg-gray-700">
                {perfil.foto_url ? (
                  <Image src={perfil.foto_url} alt={perfil.nombre} fill priority sizes="(max-width: 640px) 144px, 160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-5xl">
                    {perfil.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── 2. Info del asesor ── */}
          <div className="flex-1 flex flex-col justify-center text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-cyan-400" />
                Asesor Certificado · DriveSync
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-1">
              {perfil.nombre}
            </h3>
            {perfil.cargo && (
              <p className="text-sm text-cyan-400 font-semibold">{perfil.cargo}</p>
            )}
            {perfil.concesionario && (
              <p className="text-xs text-gray-400 mt-0.5 mb-3">{perfil.concesionario}</p>
            )}
            {perfil.frase && (
              <p className="text-xs text-gray-300 italic bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3">
                "{perfil.frase}"
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-5 mt-1">
              {perfil.anios_exp && (
                <>
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-bold text-white leading-none">{perfil.anios_exp}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Experiencia</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                </>
              )}
              {perfil.ventas_realizadas && (
                <>
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-bold text-white leading-none">{perfil.ventas_realizadas}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Ventas</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                </>
              )}
              {perfil.calificacion && (
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold text-white leading-none">{perfil.calificacion}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Calificación</p>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Logo empresa — más grande y centrado ── */}
          {perfil.logo_empresa_url && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2">
              {/* Caja cuadrada grande, centrada */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-white/15 bg-white flex items-center justify-center overflow-hidden shadow-lg p-3 relative">
                  <Image
                    src={perfil.logo_empresa_url}
                    alt={perfil.concesionario || 'Logo empresa'}
                    fill
                    priority
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-contain p-3"
                  />
              </div>
              {perfil.concesionario && (
                <p className="text-[10px] text-gray-500 text-center leading-tight max-w-[8rem]">
                  {perfil.concesionario}
                </p>
              )}
            </div>
          )}

          {/* ── 4. CTAs ── */}
          <div className="flex flex-row sm:flex-col items-center justify-center gap-3 flex-shrink-0">
            {perfil.telefono && (
              <a
                href={`tel:${perfil.telefono}`}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 transition-colors font-semibold text-sm px-5 py-3 rounded-xl shadow-lg whitespace-nowrap"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                Llamar
              </a>
            )}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white transition-colors font-semibold text-sm px-5 py-3 rounded-xl shadow-lg whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>
    </div>
  )
}
