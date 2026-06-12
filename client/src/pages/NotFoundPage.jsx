import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <span className="section-kicker">404</span>
        <h2>La ruta no está disponible en el inventario.</h2>
        <p>
          Vuelve al acceso principal o al panel de inventario para continuar con la
          operación.
        </p>

        <div className="not-found-actions">
          <Link className="not-found-action" to="/login">
            Ir al acceso
          </Link>
          <Link className="link-button" to="/app">
            Abrir inventario
          </Link>
        </div>
      </section>
    </main>
  )
}