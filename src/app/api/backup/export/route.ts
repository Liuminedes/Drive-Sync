import { NextResponse } from 'next/server'
import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from 'fflate'
import { getTenantSession } from '@/lib/tenant'
import { buildBackupData, findMediaUrls } from '@/lib/backup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  const session = await getTenantSession()
  if (!session || !['ADMIN', 'SUPERADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }
  // Solo el SuperAdmin puede exportar otra empresa
  const asked = new URL(req.url).searchParams.get('tenantId')
  const tenantId = asked && session.role === 'SUPERADMIN' ? asked : session.tenantId

  const data = await buildBackupData(tenantId)
  let text = JSON.stringify(data)
  const urls = findMediaUrls(text)

  const stream = new ReadableStream({
    async start(controller) {
      const zip = new Zip((err, chunk, final) => {
        if (err) return controller.error(err)
        controller.enqueue(chunk)
        if (final) controller.close()
      })
      const missing: string[] = []
      // Carpeta por dueño: productos/<id>, resenas/<id>, entregas/<id>; el resto en otros/
      const owner = new Map<string, string>()
      const claim = (obj: unknown, folder: string) => {
        for (const u of findMediaUrls(JSON.stringify(obj))) if (!owner.has(u)) owner.set(u, folder)
      }
      data.productos.forEach((p) => claim(p, `productos/${p.id}`))
      data.resenas.forEach((r) => claim(r, `resenas/${r.id}`))
      data.entregas.forEach((e) => claim(e, `entregas/${e.id}`))
      const used = new Set<string>()
      let i = 0
      let n = 0
      // 5 descargas en paralelo; cada imagen se escribe al zip al terminar (sin acumular en memoria)
      await Promise.all(Array.from({ length: 5 }, async () => {
        while (i < urls.length) {
          const url = urls[i++]
          // El nombre se fija antes de cualquier await: así nunca se repite entre descargas paralelas
          const base = (decodeURIComponent(url.split('?')[0].split('/').pop() ?? 'img.jpg')).replace(/[^\w.-]/g, '_')
          let name = `images/${owner.get(url) ?? 'otros'}/${base}`
          if (used.has(name)) name = `images/${owner.get(url) ?? 'otros'}/${n++}-${base}`
          used.add(name)
          try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(String(res.status))
            const f = new ZipPassThrough(name)
            zip.add(f)
            f.push(new Uint8Array(await res.arrayBuffer()), true)
            text = text.split(url).join(name)
          } catch {
            missing.push(url) // queda la URL original en el JSON
          }
        }
      }))

      const json = new ZipDeflate('data.json')
      zip.add(json)
      json.push(strToU8(text.replace('"system":"DriveSync"', `"system":"DriveSync","missing_images":${JSON.stringify(missing)}`)), true)
      zip.end()
    },
  })

  const slug = (data.tenant?.nombre ?? 'backup').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="drivesync-${slug}-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  })
}
