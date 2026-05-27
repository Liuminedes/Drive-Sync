'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLead } from '@/actions/leads'
import toast from 'react-hot-toast'
import { useState } from 'react'

const leadSchema = z.object({
  nombre_cliente: z.string().min(2, 'El nombre es muy corto'),
  email_cliente: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_cliente: z.string().min(7, 'Teléfono inválido'),
  mensaje: z.string().optional()
})

type LeadFormValues = z.infer<typeof leadSchema>

export function LeadModal({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema)
  })

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true)
    try {
      const { success, error } = await createLead({
        tenant_id: product.tenant_id,
        producto_id: product.id,
        nombre_cliente: data.nombre_cliente,
        email_cliente: data.email_cliente || null,
        telefono_cliente: data.telefono_cliente,
        mensaje: data.mensaje || null,
        origen: 'CATALOGO_PUBLICO'
      })

      if (!success) throw new Error(error || 'No se pudo enviar el contacto')

      toast.success('¡Solicitud enviada! Un asesor te contactará pronto.')
      reset()
      onClose()
    } catch (err: any) {
      toast.error('Hubo un error al enviar tu solicitud.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="tracking-tight">Me interesa este vehículo</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Déjanos tus datos y un asesor se comunicará contigo para darte más información sobre el {product.titulo}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_cliente" className="text-xs text-muted-foreground">Nombre completo</Label>
            <Input id="nombre_cliente" className="h-9" {...register('nombre_cliente')} placeholder="Ej. Juan Pérez" />
            {errors.nombre_cliente && <p className="text-xs text-red-500">{errors.nombre_cliente.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono_cliente" className="text-xs text-muted-foreground">Teléfono</Label>
              <Input id="telefono_cliente" className="h-9" {...register('telefono_cliente')} placeholder="Ej. 3001234567" />
              {errors.telefono_cliente && <p className="text-xs text-red-500">{errors.telefono_cliente.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_cliente" className="text-xs text-muted-foreground">Correo electrónico (Opcional)</Label>
              <Input id="email_cliente" type="email" className="h-9" {...register('email_cliente')} placeholder="juan@ejemplo.com" />
              {errors.email_cliente && <p className="text-xs text-red-500">{errors.email_cliente.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensaje" className="text-xs text-muted-foreground">Mensaje (Opcional)</Label>
            <Textarea id="mensaje" {...register('mensaje')} placeholder="¿Tienes alguna pregunta específica?" className="resize-none" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
