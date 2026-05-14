import React, { useCallback, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'

export function ImageUpload({ images, setImages }: { images: File[], setImages: React.Dispatch<React.SetStateAction<File[]>> }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      setImages(prev => [...prev, ...newFiles])
    }
  }, [setImages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
      setImages(prev => [...prev, ...newFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-8 h-8 text-muted-foreground mb-4" />
        <p className="text-sm tracking-tight font-medium">Arrastra y suelta tus imágenes aquí</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">o haz clic para seleccionar</p>
        <label className="cursor-pointer">
          <span className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors">
            Seleccionar archivos
          </span>
          <input 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video rounded-md overflow-hidden bg-muted border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(img)} alt={`Upload ${i}`} className="object-cover w-full h-full" />
              <button 
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
