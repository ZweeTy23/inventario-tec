import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Label, TextInput, Button, Alert } from 'flowbite-react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const features = [
  {
    title: 'Control de Stock',
    description: 'Monitorización en tiempo real de existencias y niveles mínimos.',
  },
  {
    title: 'Movimientos',
    description: 'Gestión completa de entradas, salidas y transferencias.',
  },
  {
    title: 'Alertas IA',
    description: 'Notificaciones automáticas sobre productos críticos o próximos a vencer.',
  },
  {
    title: 'Multi-Almacén',
    description: 'Soporte para múltiples sedes y ubicaciones jerárquicas.',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname ?? '/app'
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.')
      return
    }

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate(fromPath, { replace: true })
    } else {
      setError(result.error || 'Credenciales inválidas. Verifica tu correo y contraseña.')
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso al sistema"
      title="Potencia tu Control de Inventario"
      subtitle="Gestiona tu almacén con eficiencia, seguridad y precisión total en cada movimiento."
      features={features}
      footer="Plataforma de Inventario TEC"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <Alert color="failure" className="rounded-xl border-l-4">
            <span className="font-medium text-xs">{error}</span>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Correo electrónico" className="font-bold text-gray-700 dark:text-gray-300" />
            </div>
            <TextInput
              id="email"
              type="email"
              icon={Mail}
              placeholder="nombre@empresa.com"
              required
              disabled={loading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="[&>div>input]:rounded-xl [&>div>input]:border-gray-200"
            />
          </div>

          <div>
            <div className="mb-2 block flex justify-between items-center">
              <Label htmlFor="password" value="Contraseña" className="font-bold text-gray-700 dark:text-gray-300" />
              <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <TextInput
              id="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              disabled={loading}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="[&>div>input]:rounded-xl [&>div>input]:border-gray-200"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verificando...</span>
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿No tienes acceso? <span className="font-bold text-indigo-600 cursor-pointer hover:underline">Contacta al Administrador</span>
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
