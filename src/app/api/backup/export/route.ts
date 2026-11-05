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
      const images: { name: string; bytes: Uint8Array }[] = []
      const missing: string[] = []
      let i = 0
      let n = 0 // el nombre se asigna antes del await: con 5 descargas en paralelo, images.length se repetía
      // 5 descargas en paralelo
      await Promise.all(Array.from({ length: 5 }, async () => {
        while (i < urls.length) {
          const url = urls[i++]
          try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(String(res.status))
            const ext = (url.split('?')[0].match(/\.(\w{1,5})$/)?.[1] ?? 'jpg').toLowerCase()
            const name = `images/${n++}.${ext}`
            images.push({ name, bytes: new Uint8Array(await res.arrayBuffer()) })
            text = text.split(url).join(name)
          } catch {
            missing.push(url) // queda la URL original en el JSON
          }
        }
      }))

      const json = new ZipDeflate('data.json')
      zip.add(json)
      json.push(strToU8(text.replace('"system":"DriveSync"', `"system":"DriveSync","missing_images":${JSON.stringify(missing)}`)), true)
      for (const img of images) {
        const f = new ZipPassThrough(img.name)
        zip.add(f)
        f.push(img.bytes, true)
      }
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
