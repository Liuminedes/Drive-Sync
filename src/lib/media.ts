import { requireTenantSession } from '@/lib/tenant'

export const MEDIA_BASE = (process.env.MEDIA_BASE_URL || 'https://intranet.almotores.com/CyD/wp-content/_api_media_test').replace(/\/$/, '')
const MAX_BYTES = 10 * 1024 * 1024

/** Sube una imagen al hosting de medios. Exige sesión, tipo imagen y tamaño ≤ 10 MB. */
export async function uploadImage(formData: FormData, folder: string) {
  try {
    await requireTenantSession()
    const file = formData.get('file') as File | null
    if (!file) return { success: false as const, error: 'No se envió ningún archivo' }
    if (!file.type.startsWith('image/')) return { success: false as const, error: 'Solo se permiten imágenes' }
    if (file.size > MAX_BYTES) return { success: false as const, error: 'La imagen supera los 10 MB' }

    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.\./g, '')
    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5)
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const body = new FormData()
    body.append('file', file)
    body.append('path', path)

    const res = await fetch(`${MEDIA_BASE}/upload.php`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.UPLOAD_SECRET_KEY}` },
      body,
    })
    if (!res.ok) return { success: false as const, error: `Error subiendo archivo: ${await res.text()}` }
    const data = await res.json()
    return { success: true as const, path: data.path as string, url: `${MEDIA_BASE}/${data.path}` }
  } catch (e: any) {
    return { success: false as const, error: e.message as string }
  }
}
