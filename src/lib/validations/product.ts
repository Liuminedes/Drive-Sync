import { z } from 'zod'

export const productSchema = z.object({
  titulo: z.string().min(3, 'El título es requerido'),
  categoria: z.enum(['VEHICULO_USADO', 'VEHICULO_NUEVO', 'MOTOCICLETA', 'MAQUINARIA', 'OTRO']),
  precio_venta: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
  estado: z.enum(['DISPONIBLE', 'EN_NEGOCIACION', 'RESERVADO', 'VENDIDO', 'INACTIVO']).default('DISPONIBLE'),
  sede_id: z.string().optional(),
  asesor_id: z.string().optional(),
  detalles: z.object({
    marca: z.string().optional(),
    modelo: z.string().optional(),
    anio: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional().or(z.literal(0)),
    kilometraje: z.coerce.number().min(0).optional().or(z.literal(0)),
    carroceria: z.string().optional(),
    transmision: z.enum(['Manual', 'Automática', 'Automatica', 'CVT', 'Otra', '']).optional(),
    combustible: z.enum(['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'Otro', '']).optional(),
    motor: z.string().optional(),
    traccion: z.enum(['4x2', '4x4', 'AWD', 'RWD', 'FWD', '']).optional(),
    color_exterior: z.string().optional(),
    color_interior: z.string().optional(),
    puertas: z.coerce.number().min(0).optional().or(z.literal(0)),
    pasajeros: z.coerce.number().min(0).optional().or(z.literal(0)),
  }).optional()
})

export type ProductFormValues = z.infer<typeof productSchema>
