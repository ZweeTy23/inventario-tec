import { useState } from 'react'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLocation, useNavigate } from '../router/AppRouter.jsx'

const features = [
  {
    title: 'Stock',
    description: 'Existencias y mínimos al instante.',
  },
  {
    title: 'Movimientos',
    description: 'Entradas, salidas y traspasos.',
  },
  {
    title: 'Alertas',
    description: 'Stock bajo y productos críticos.',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const fromPath = location.state?.from?.pathname ?? '/app'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  })

  function validate(values) {
    const errors = {
      email: '',
      password: '',
    }

    const email = values.email.trim()
    const password = values.password.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      errors.email = 'Ingresa tu correo electrónico.'
    } else if (!emailRegex.test(email)) {
      errors.email = 'Ingresa un correo válido (ejemplo@empresa.com).'
    }

    if (!password) {
      errors.password = 'Ingresa tu contraseña.'
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    return errors
  }

  function hasErrors(errors) {
    return Boolean(errors.email || errors.password)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))

    if (fieldErrors[name]) {
      const nextValues = { ...formData, [name]: value }
      const nextErrors = validate(nextValues)
      setFieldErrors((current) => ({
        ...current,
        [name]: nextErrors[name],
      }))
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target
    const nextValues = { ...formData, [name]: value }
    const nextErrors = validate(nextValues)
    setFieldErrors((current) => ({
      ...current,
      [name]: nextErrors[name],
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(formData)
    setFieldErrors(nextErrors)

    if (hasErrors(nextErrors)) {
      return
    }

    login({
      name: formData.email.split('@')[0],
      email: formData.email,
    })

    navigate(fromPath, { replace: true })
  }

  return (
    <AuthShell
      eyebrow="Acceso al sistema"
      title="Inicia sesión en Inventario TEC"
      subtitle="Accede al panel operativo de inventario."
      features={features}
      footer="Operación centralizada"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Correo electrónico</span>
            <input
              autoComplete="email"
              className={fieldErrors.email ? 'is-invalid' : ''}
              onBlur={handleBlur}
              name="email"
              onChange={handleChange}
              placeholder="usuario@empresa.com"
              type="email"
              value={formData.email}
            />
            {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              autoComplete="current-password"
              className={fieldErrors.password ? 'is-invalid' : ''}
              onBlur={handleBlur}
              name="password"
              onChange={handleChange}
              placeholder="Tu contraseña"
              type="password"
              value={formData.password}
            />
            {fieldErrors.password ? (
              <p className="field-error">{fieldErrors.password}</p>
            ) : null}
          </label>
        </div>

        <button className="auth-action" type="submit">
          Entrar al inventario
        </button>

        <div className="auth-helper">
          <span>¿No tienes acceso? Solicítalo al administrador.</span>
        </div>
      </form>
    </AuthShell>
  )
}