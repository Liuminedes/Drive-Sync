'use client'

import { Phone, MessageCircle, Star } from 'lucide-react'

// Reemplaza ADVISOR_PHOTO_URL con la URL real de la foto del asesor
// cuando tengas la imagen lista. Por ahora usa un placeholder.
const ADVISOR_PHOTO_URL = '/foto-ivan.jpeg' // <-- Aquí va la URL de la foto

export function AdvisorCard() {
  return (
    <div className="mb-10 w-full">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-white/10">
        
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 p-6 sm:p-8">
          
          {/* Avatar circular */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-md opacity-40 scale-110" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl bg-gray-700">
                {ADVISOR_PHOTO_URL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ADVISOR_PHOTO_URL}
                    alt="Foto del asesor"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Placeholder hasta recibir la foto */
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                )}
              </div>
              {/* Verified badge */}
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
                Asesor Certificado
              </span>
            </div>

            {/* Nombre */}
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Tu Asesor de Confianza
              {/* Reemplaza con: Nombre Apellido */}
            </h3>

            {/* Subtítulo */}
            <p className="text-sm text-gray-400 mt-1">
              Especialista en vehículos certificados · DriveSync 2026
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-white leading-none">+200</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Ventas</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-white leading-none">4.9★</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Calificación</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-white leading-none">3 años</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Experiencia</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-3 flex-shrink-0">
            <a
              href="tel:+573001234567"
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 transition-colors font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden md:inline">Llamar</span>
            </a>
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white transition-colors font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>
    </div>
  )
}
