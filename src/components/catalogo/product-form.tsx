'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '@/lib/validations/product'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from './image-upload'
import { ArrowLeft, ArrowRight, Star, Trash2 } from 'lucide-react'

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ initialData }: { initialData?: any }) {
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<any[]>(initialData?.producto_fotos || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sedes, setSedes] = useState<any[]>([])
  const [asesores, setAsesores] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      titulo: initialData?.titulo || '',
      categoria: initialData?.categoria || 'VEHICULO_USADO',
      precio_venta: initialData?.precio_venta || 0,
      moneda: initialData?.moneda || 'COP',
      estado: initialData?.estado || 'DISPONIBLE',
      sede_id: initialData?.sede_id || '',
      asesor_id: initialData?.asesor_id || '',
      detalles: {
        marca: initialData?.detalles?.marca || '',
        modelo: initialData?.detalles?.modelo || '',
        anio: initialData?.detalles?.anio || 0,
        kilometraje: initialData?.detalles?.kilometraje || 0,
        transmision: initialData?.detalles?.transmision || '',
        combustible: initialData?.detalles?.combustible || '',
        motor: initialData?.detalles?.motor || '',
        traccion: initialData?.detalles?.traccion || '',
        color_exterior: initialData?.detalles?.color_exterior || '',
        color_interior: initialData?.detalles?.color_interior || '',
      }
    }
  })

  useEffect(() => {
    async function fetchData() {
      const { data: s } = await supabase.from('sedes').select('*')
      if (s) setSedes(s)
      const { data: a } = await supabase.from('usuarios').select('*').eq('rol', 'ASESOR')
      if (a) setAsesores(a)
    }
    fetchData()
  }, [])

  const handleDeleteExistingImage = async (id: string, path: string) => {
    if (!confirm('¿Eliminar esta foto permanentemente?')) return
    try {
      const fileName = path.split('/').pop()
      if (fileName) {
        await supabase.storage.from('drive-sync-media').remove([`productos/${fileName}`])
      }
      await supabase.from('producto_fotos').delete().eq('id', id)
      setExistingImages(prev => prev.filter(img => img.id !== id))
      toast.success('Foto eliminada')
    } catch (err) {
      toast.error('Error al eliminar la foto')
    }
  }

  const handleMoveImage = async (index: number, direction: 'left' | 'right') => {
    const newImages = [...existingImages]
    const swapIndex = direction === 'left' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newImages.length) return

    // Swap positions
    ;[newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]]

    // Update portada: first image is always portada
    const updated = newImages.map((img, i) => ({ ...img, es_portada: i === 0, orden: i }))
    setExistingImages(updated)

    // Persist to DB
    for (const img of updated) {
      await supabase
        .from('producto_fotos')
        .update({ es_portada: img.es_portada, orden: img.orden })
        .eq('id', img.id)
    }
    toast.success('Orden actualizado')
  }

  const handleSetPortada = async (id: string) => {
    const updated = existingImages.map(img => ({ ...img, es_portada: img.id === id }))
    setExistingImages(updated)
    for (const img of updated) {
      await supabase
        .from('producto_fotos')
        .update({ es_portada: img.es_portada })
        .eq('id', img.id)
    }
    toast.success('Portada actualizada')
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const tenant_id = '11111111-1111-1111-1111-111111111111'
      
      let productId = initialData?.id

      if (!productId) {
        const { data: newProduct, error: productError } = await supabase
          .from('productos')
          .insert({
            tenant_id,
            sede_id: data.sede_id || null,
            asesor_id: data.asesor_id || null,
            categoria: data.categoria,
            titulo: data.titulo,
            precio_venta: data.precio_venta,
            moneda: data.moneda || 'COP',
            estado: data.estado,
            detalles: data.detalles
          })
          .select()
          .single()

        if (productError) throw productError
        productId = newProduct.id
      } else {
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            sede_id: data.sede_id || null,
            asesor_id: data.asesor_id || null,
            categoria: data.categoria,
            titulo: data.titulo,
            precio_venta: data.precio_venta,
            moneda: data.moneda || 'COP',
            estado: data.estado,
            detalles: data.detalles
          })
          .eq('id', productId)
        if (updateError) throw updateError
      }

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const fileExt = file.name.split('.').pop()
          const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `productos/${safeName}`
          
          const { error: uploadError } = await supabase.storage
            .from('drive-sync-media')
            .upload(filePath, file)
            
          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase.storage
            .from('drive-sync-media')
            .getPublicUrl(filePath)

          await supabase.from('producto_fotos').insert({
            producto_id: productId,
            url: publicUrlData.publicUrl,
            es_portada: existingImages.length === 0 && i === 0,
            orden: existingImages.length + i
          })
        }
      }

      toast.success(initialData ? 'Producto actualizado' : 'Producto creado exitosamente')
      router.push('/dashboard/inventario')
      router.refresh()
    } catch (err: any) {
      toast.error('Error guardando el producto: ' + err.message)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: any) => {
    console.log("Validation errors:", errors)
    toast.error('Hay errores en el formulario, por favor revisa los campos.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 bg-white dark:bg-background p-6 md:p-8 rounded-xl border border-border/60 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium tracking-tight mb-4">Información Principal</h3>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs text-muted-foreground">Título del Vehículo / Producto</Label>
          <Input className="h-10 text-lg font-medium" {...register('titulo')} placeholder="Ej. Toyota 4Runner SR5 2023" />
          {errors.titulo && <p className="text-xs text-red-500">{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Precio de Venta</Label>
          <div className="flex gap-2">
            {/* Selector de moneda */}
            <Select
              onValueChange={(val: any) => setValue('moneda', val)}
              value={watch('moneda') || 'COP'}
            >
              <SelectTrigger className="h-9 w-24 shrink-0 font-semibold">
                <SelectValue placeholder="COP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">🇨🇴 COP</SelectItem>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input className="h-9 font-medium" type="number" {...register('precio_venta')} placeholder="Ej. 78990000" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {watch('moneda') === 'COP'
              ? 'Ingresa el precio en pesos colombianos (COP)'
              : 'Ingresa el precio en dólares estadounidenses (USD)'}
          </p>
          {errors.precio_venta && <p className="text-xs text-red-500">{errors.precio_venta.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Categoría</Label>
          <Select key={`cat-${initialData?.categoria || 'new'}`} onValueChange={(val: any) => setValue('categoria', val)} defaultValue={watch('categoria')}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VEHICULO_USADO">Vehículo Usado</SelectItem>
              <SelectItem value="VEHICULO_NUEVO">Vehículo Nuevo</SelectItem>
              <SelectItem value="MOTOCICLETA">Motocicleta</SelectItem>
              <SelectItem value="MAQUINARIA">Maquinaria</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select key={`est-${initialData?.estado || 'new'}`} onValueChange={(val: any) => setValue('estado', val)} defaultValue={watch('estado')}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Estado del producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DISPONIBLE">Disponible</SelectItem>
              <SelectItem value="EN_NEGOCIACION">En Negociación</SelectItem>
              <SelectItem value="RESERVADO">Reservado</SelectItem>
              <SelectItem value="VENDIDO">Vendido</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Sede (Ubicación)</Label>
          {sedes.length > 0 ? (
            <Select key={`sede-select-${sedes.length}`} onValueChange={(val: any) => setValue('sede_id', val)} defaultValue={watch('sede_id') || undefined}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecciona Sede" />
              </SelectTrigger>
              <SelectContent>
                {sedes.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm opacity-50 flex items-center">
              Cargando sedes...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Asesor Asignado</Label>
          {asesores.length > 0 ? (
            <Select key={`asesor-select-${asesores.length}`} onValueChange={(val: any) => setValue('asesor_id', val)} defaultValue={watch('asesor_id') || undefined}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecciona Asesor" />
              </SelectTrigger>
              <SelectContent>
                {asesores.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre_completo}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm opacity-50 flex items-center">
              Cargando asesores...
            </div>
          )}
        </div>

        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium tracking-tight mb-4">Especificaciones Técnicas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:col-span-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Marca</Label>
            <Input className="h-9" {...register('detalles.marca')} placeholder="Ej. Toyota" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Modelo</Label>
            <Input className="h-9" {...register('detalles.modelo')} placeholder="Ej. Corolla" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Año</Label>
            <Input type="number" className="h-9" {...register('detalles.anio')} placeholder="Ej. 2022" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Kilometraje</Label>
            <Input type="number" className="h-9" {...register('detalles.kilometraje')} placeholder="Ej. 20000" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Transmisión</Label>
            <Select key={`trans-${initialData?.detalles?.transmision || 'new'}`} onValueChange={(val: any) => setValue('detalles.transmision', val)} defaultValue={watch('detalles.transmision') || undefined}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automática">Automática</SelectItem>
                <SelectItem value="CVT">CVT</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Combustible</Label>
            <Select key={`comb-${initialData?.detalles?.combustible || 'new'}`} onValueChange={(val: any) => setValue('detalles.combustible', val)} defaultValue={watch('detalles.combustible') || undefined}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasolina">Gasolina</SelectItem>
                <SelectItem value="Diésel">Diésel</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
                <SelectItem value="Eléctrico">Eléctrico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Motor (CC / HP)</Label>
            <Input className="h-9" {...register('detalles.motor')} placeholder="Ej. 2.0L Turbo" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tracción</Label>
            <Select key={`trac-${initialData?.detalles?.traccion || 'new'}`} onValueChange={(val: any) => setValue('detalles.traccion', val)} defaultValue={watch('detalles.traccion') || undefined}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4x2">4x2</SelectItem>
                <SelectItem value="4x4">4x4</SelectItem>
                <SelectItem value="AWD">AWD</SelectItem>
                <SelectItem value="FWD">FWD</SelectItem>
                <SelectItem value="RWD">RWD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Color Exterior</Label>
            <Input className="h-9" {...register('detalles.color_exterior')} placeholder="Ej. Blanco Perla" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Color Interior</Label>
            <Input className="h-9" {...register('detalles.color_interior')} placeholder="Ej. Cuero Negro" />
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-medium tracking-tight mb-4">Fotos del Producto</h3>
          
          {existingImages.length > 0 && (
            <div className="mb-6">
              <Label className="text-xs text-muted-foreground block mb-2">Fotos Actuales — Usa las flechas para reordenar. ⭐ = Portada</Label>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {existingImages.map((img, idx) => (
                  <div key={img.id} className="relative shrink-0 w-28">
                    <div className="relative group w-28 h-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={`Foto ${idx + 1}`} className={`w-full h-full object-cover rounded-lg border-2 transition-all ${img.es_portada ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`} />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</div>
                      {img.es_portada && <div className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> Portada</div>}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <button type="button" disabled={idx === 0} onClick={() => handleMoveImage(idx, 'left')} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      {!img.es_portada && (
                        <button type="button" onClick={() => handleSetPortada(img.id)} title="Hacer portada" className="p-1 rounded border border-border hover:bg-yellow-50 hover:border-yellow-300 transition-colors">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteExistingImage(img.id, img.url)} className="p-1 rounded border border-border hover:bg-red-50 hover:border-red-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                      <button type="button" disabled={idx === existingImages.length - 1} onClick={() => handleMoveImage(idx, 'right')} className="p-1 rounded border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Label className="text-xs text-muted-foreground block mb-2">Subir Nuevas Fotos</Label>
          <ImageUpload images={images} setImages={setImages} />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
        <Button variant="outline" type="button" onClick={() => router.back()} className="h-10">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="h-10 min-w-[120px]">
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}
