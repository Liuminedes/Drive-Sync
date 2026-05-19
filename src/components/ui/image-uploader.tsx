/**
 * ImageUploader — componente reutilizable de subida de fotos
 * Usado en: Inventario, Reseñas, Entregas, Perfil
 *
 * Maneja:
 *  - Drag & drop
 *  - Selección múltiple
 *  - Vista previa local antes de subir
 *  - Subida a Supabase Storage (bucket: drive-sync-media)
 *  - Retorna URLs públicas ya subidas
 */
'use client'

import { useCallback, useState } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  /** Carpeta dentro del bucket, ej: "entregas" | "resenas" | "perfil" */
  folder: string
  /** Cuántas fotos puede subir (default: ilimitado) */
  maxFiles?: number
  /** Callback con las URLs públicas ya subidas */
  onUploaded: (urls: string[]) => void
  /** Texto descriptivo debajo del icono */
  hint?: string
}

export function ImageUploader({ folder, maxFiles, onUploaded, hint }: Props) {
  const [isDragging, setIsDragging]   = useState(false)
  const [previews, setPreviews]       = useState<{ file: File; url: string }[]>([])
  const [uploading, setUploading]     = useState(false)
  const [progress, setProgress]       = useState(0)
  const supabase = createClient()

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    const limited = maxFiles ? arr.slice(0, maxFiles - previews.length) : arr
    const newPreviews = limited.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setPreviews(prev => [...prev, ...newPreviews])
  }, [previews.length, maxFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = '' // reset so same file can be re-added
  }

  const remove = (i: number) => {
    URL.revokeObjectURL(previews[i].url)
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const upload = async () => {
    if (!previews.length) return
    setUploading(true)
    setProgress(0)
    const urls: string[] = []
    try {
      for (let i = 0; i < previews.length; i++) {
        const { file } = previews[i]
        const ext      = file.name.split('.').pop()
        const name     = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const path     = `${folder}/${name}`

        const { error } = await supabase.storage
          .from('drive-sync-media')
          .upload(path, file, { upsert: false })

        if (error) throw error

        const { data } = supabase.storage
          .from('drive-sync-media')
          .getPublicUrl(path)

        urls.push(data.publicUrl)
        setProgress(Math.round(((i + 1) / previews.length) * 100))
      }
      onUploaded(urls)
      // Limpiar previews después de subir
      previews.forEach(p => URL.revokeObjectURL(p.url))
      setPreviews([])
    } catch (err: any) {
      alert('Error subiendo imagen: ' + err.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag} onDragLeave={handleDrag}
        onDragOver={handleDrag} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30'}`}
      >
        <UploadCloud className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm font-medium tracking-tight">Arrastra y suelta tus imágenes aquí</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {hint || 'o haz clic para seleccionar · JPG, PNG, WEBP'}
        </p>
        <label className="cursor-pointer">
          <span className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
            Seleccionar archivos
          </span>
          <input type="file" className="hidden" multiple accept="image/*" onChange={handleInput} />
        </label>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {previews.map((p, i) => (
              <div key={i} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button" onClick={() => remove(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-semibold">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Upload button + progress */}
          <div className="flex items-center gap-3">
            <button
              type="button" onClick={upload} disabled={uploading}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 h-9 px-4 rounded-md text-sm font-medium transition-colors"
            >
              {uploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo {progress}%...</>
              ) : (
                <><UploadCloud className="w-3.5 h-3.5" /> Subir {previews.length} foto{previews.length > 1 ? 's' : ''}</>
              )}
            </button>
            {!uploading && (
              <button type="button" onClick={() => { previews.forEach(p => URL.revokeObjectURL(p.url)); setPreviews([]) }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Limpiar
              </button>
            )}
          </div>

          {uploading && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
