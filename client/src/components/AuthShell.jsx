import { Package } from 'lucide-react'

export default function AuthShell({ eyebrow, title, subtitle, features = [], footer, children }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 overflow-hidden font-sans">
      {/* Visual Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 p-12 flex-col justify-between text-white overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-indigo-600" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Inventario TEC</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-black leading-tight tracking-tighter">
              {title || "Gestión de Inventarios de Clase Mundial"}
            </h1>
            <p className="text-lg text-indigo-100 max-w-lg leading-relaxed">
              {subtitle || "Optimiza tu flujo de trabajo, controla tus existencias y toma decisiones basadas en datos reales."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            {features.map((feature, i) => (
              <div key={i} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-indigo-100/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-indigo-200">
          <span>{footer || "© 2026 Inventario TEC"}</span>
          <div className="flex gap-4">
            <span className="px-2 py-1 bg-white/10 rounded">v1.0.0</span>
            <span className="px-2 py-1 bg-green-400 text-green-900 rounded">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              {eyebrow || "Seguridad Avanzada"}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {eyebrow === "Acceso al sistema" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Por favor, ingresa tus credenciales para continuar.
            </p>
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={18} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">Inventario TEC</span>
        </div>
      </div>
    </div>
  )
}
