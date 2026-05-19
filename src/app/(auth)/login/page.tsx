'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { Car } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await login(email, password)

      if (!res?.success) {
        toast.error(res?.error || 'Credenciales incorrectas')
        return
      }

      toast.success('¡Bienvenido!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error('Ocurrió un error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-2xl tracking-tighter">D</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
          Bienvenido a DriveSync
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Ingresa tus credenciales para administrar tu inventario
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-background py-8 px-4 shadow-sm border border-border/60 sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
                placeholder="admin@drivesync.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-10 font-medium" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
