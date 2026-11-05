'use client'

import { useRef, useState } from 'react'
import { unzipSync, strFromU8 } from 'fflate'
import toast from 'react-hot-toast'
import { Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadToGigacore } from '@/actions/upload'
import { importBackupChunk, finishImport, type BackupTable } from '@/actions/backup'

const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }

export function BackupPanel() {
  const [status, setStatus] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const busy = status !== ''

  async function restore(file: File) {
    if (!confirm('Se agregarán/actualizarán los datos del backup en tu empresa. No se borra nada existente. ¿Continuar?')) return
    try {
      setStatus('Leyendo archivo…')
      const files = unzipSync(new Uint8Array(await file.arrayBuffer()))
      if (!files['data.json']) throw new Error('El zip no contiene data.json')
      let text = strFromU8(files['data.json'])

      // 1. Subir imágenes y reescribir sus rutas relativas a las URLs nuevas
      const imgs = Object.keys(files).filter((n) => n.startsWith('images/'))
      const map: Record<string, string> = {}
      for (const [i, name] of imgs.entries()) {
        setStatus(`Subiendo imágenes ${i + 1}/${imgs.length}…`)
        const ext = name.split('.').pop()!.toLowerCase()
        const fd = new FormData()
        fd.append('file', new File([files[name] as BlobPart], name.split('/').pop()!, { type: MIME[ext] ?? 'image/jpeg' }))
        const res = await uploadToGigacore(fd, 'restaurado')
        if (!res.success) throw new Error(`No se pudo subir ${name}: ${res.error}`)
        map[name] = res.url
      }
      text = text.replace(/images\/\d+\.\w+/g, (m) => map[m] ?? m)
      const data = JSON.parse(text)
      if (data?.meta?.version !== 1) throw new Error('Versión de backup no soportada')

      // 2. Datos por tablas, en orden de dependencias y en lotes
      const productos: any[] = data.productos ?? []
      const plan: [BackupTable, any[]][] = [
        ['usuarios', data.usuarios ?? []],
        ['sedes', data.sedes ?? []],
        ['perfil_asesor', data.perfil ? [data.perfil] : []],
        ['productos', productos],
        ['producto_fotos', productos.flatMap((p) => p.producto_fotos ?? [])],
        ['resenas', data.resenas ?? []],
        ['entregas', data.entregas ?? []],
        ['leads', data.leads ?? []],
      ]
      for (const [table, rows] of plan) {
        for (let i = 0; i < rows.length; i += 200) {
          setStatus(`Restaurando ${table} ${Math.min(i + 200, rows.length)}/${rows.length}…`)
          const res = await importBackupChunk(table, rows.slice(i, i + 200))
          if (!res.success) throw new Error(`${table}: ${res.error}`)
        }
      }
      await finishImport()
      toast.success('Backup restaurado correctamente')
    } catch (e: any) {
      toast.error(e.message || 'Error al restaurar')
    } finally {
      setStatus('')
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-white dark:bg-background shadow-sm p-5 space-y-3">
      <div>
        <h3 className="font-semibold tracking-tight">Backup y migración</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Descarga un .zip con todos tus datos e imágenes, o restaura uno en este sistema. El archivo incluye contraseñas cifradas: guárdalo en un lugar seguro.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <a href="/api/backup/export" download>
          <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto"><Download className="w-4 h-4" />Descargar backup</Button>
        </a>
        <Button type="button" className="gap-2" disabled={busy} onClick={() => input.current?.click()}>
          <Upload className="w-4 h-4" />{busy ? status : 'Restaurar backup'}
        </Button>
        <input ref={input} type="file" accept=".zip" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
      </div>
    </div>
  )
}
