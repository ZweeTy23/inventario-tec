export default function AuthShell({
  title,
  subtitle,
  eyebrow,
  features,
  children,
  footer,
}) {
  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-visual">
          <div>
            <div className="brand-badge">
              <span className="brand-badge-mark">IT</span>
              <span>Inventario TEC</span>
            </div>
            <h1>Controla tu inventario sin fricción.</h1>
            <p>Stock, movimientos y almacenes en tiempo real.</p>

            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <strong>{feature.title}</strong>
                  <span>{feature.description}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="auth-footer">
            <span className="mini-chip">Inventario central</span>
            <span>{footer}</span>
          </div>
        </aside>

        <section className="auth-panel">
          <span className="section-kicker">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {children}
        </section>
      </div>
    </section>
  )
}