const kpis = [
  {
    label: 'Valor inventario',
    value: '$ 1.28M',
    trend: '+4.2%',
    tone: 'info',
  },
  {
    label: 'Productos activos',
    value: '1,246',
    trend: '+12',
    tone: 'success',
  },
  {
    label: 'Stock bajo',
    value: '34',
    trend: '-8',
    tone: 'warning',
  },
  {
    label: 'Sin stock',
    value: '7',
    trend: '+2',
    tone: 'danger',
  },
]

const movementFeed = [
  {
    type: 'Entrada',
    detail: '25 unidades de Cable HDMI',
    time: 'Hace 8 min',
    tone: 'success',
  },
  {
    type: 'Salida',
    detail: '8 unidades de Teclado Mecánico',
    time: 'Hace 22 min',
    tone: 'danger',
  },
  {
    type: 'Ajuste',
    detail: 'Corrección de +3 en Monitor 24"',
    time: 'Hace 41 min',
    tone: 'info',
  },
]

const lowStockRows = [
  {
    sku: 'SKU-2019',
    product: 'Batería UPS 12V',
    stock: '4',
    min: '10',
    status: 'Bajo',
  },
  {
    sku: 'SKU-4481',
    product: 'Mouse Inalámbrico',
    stock: '2',
    min: '8',
    status: 'Crítico',
  },
  {
    sku: 'SKU-9092',
    product: 'SSD 1TB NVMe',
    stock: '6',
    min: '12',
    status: 'Bajo',
  },
]

export default function DashboardPage() {
  return (
    <>
      <section className="hero-banner">
        <div>
          <p className="hero-banner-kicker">Flujo de hoy</p>
          <h3>128 movimientos registrados</h3>
          <p>Entradas y salidas en sincronia con el almacen principal.</p>
        </div>
        <div className="hero-badges">
          <span className="status-pill is-ready">Inventario activo</span>
          <span className="status-pill is-live">34 alertas bajo revision</span>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <article className={`kpi-card tone-${kpi.tone}`} key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.trend}</p>
          </article>
        ))}
      </section>

      <section className="work-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="section-kicker">Movimientos</span>
              <h3>Actividad reciente</h3>
            </div>
          </div>

          <div className="activity-stack">
            {movementFeed.map((movement) => (
              <div className="activity-item" key={`${movement.type}-${movement.time}`}>
                <span className={`dot tone-${movement.tone}`} aria-hidden="true"></span>
                <div>
                  <strong>{movement.type}</strong>
                  <p>{movement.detail}</p>
                </div>
                <small>{movement.time}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="section-kicker">Reabastecimiento</span>
              <h3>Productos con stock bajo</h3>
            </div>
          </div>

          <div className="stock-table" role="table" aria-label="Tabla de stock bajo">
            <div className="stock-head" role="rowgroup">
              <span role="columnheader">SKU</span>
              <span role="columnheader">Producto</span>
              <span role="columnheader">Stock</span>
              <span role="columnheader">Minimo</span>
              <span role="columnheader">Estado</span>
            </div>

            {lowStockRows.map((row) => (
              <div className="stock-row" key={row.sku} role="row">
                <span>{row.sku}</span>
                <span>{row.product}</span>
                <span>{row.stock}</span>
                <span>{row.min}</span>
                <span className={`status-pill ${row.status === 'Crítico' ? 'is-live' : 'is-ready'}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
