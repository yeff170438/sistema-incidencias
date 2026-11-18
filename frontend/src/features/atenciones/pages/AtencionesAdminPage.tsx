
import { useMemo, useState } from 'react'
import type { Atencion } from '../types/atencion.types'
import { useAtenciones } from '../hooks/useAtenciones'
import './atenciones-admin.css'

type EstadoFiltro = 'TODOS' | 'EN PROCESO' | 'FINALIZADA'

function estadoAtencion(atencion: Atencion): EstadoFiltro {
  return atencion.fecha_fin ? 'FINALIZADA' : 'EN PROCESO'
}

function fechaLegible(fecha?: string | null): string {
  if (!fecha) return '—'

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function AtencionesAdminPage() {
  const {
    atenciones,
    cargando,
    error,
    recargar,
  } = useAtenciones()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] =
    useState<EstadoFiltro>('TODOS')
  const [detalle, setDetalle] = useState<Atencion | null>(null)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return atenciones.filter((atencion) => {
      const campos = [
        atencion.codigo_ticket,
        atencion.codigo_incidencia,
        atencion.descripcion_atencion,
        atencion.oficina,
        atencion.usuario,
        atencion.estado_ticket,
        atencion.resultado,
        atencion.conclusion,
      ]

      const coincideTexto =
        !texto ||
        campos.some((valor) =>
          String(valor ?? '').toLowerCase().includes(texto),
        )

      const coincideEstado =
        filtroEstado === 'TODOS' ||
        estadoAtencion(atencion) === filtroEstado

      return coincideTexto && coincideEstado
    })
  }, [atenciones, busqueda, filtroEstado])

  const enProceso = atenciones.filter(
    (atencion) => !atencion.fecha_fin,
  ).length

  const finalizadas = atenciones.filter(
    (atencion) => Boolean(atencion.fecha_fin),
  ).length

  const oficinas = new Set(
    atenciones
      .map((atencion) => atencion.oficina)
      .filter(Boolean),
  ).size

  return (
    <main className="atenciones-admin">
      <header className="atenciones-header">
        <div>
          <span className="atenciones-eyebrow">
            PANEL DE ADMINISTRACIÓN
          </span>
          <h1>Supervisión de atenciones</h1>
          <p>
            Consulta el trabajo de atención de incidencias
            realizado por las oficinas municipales.
          </p>
        </div>

        <div className="atenciones-readonly">
          <span aria-hidden="true">●</span> Solo lectura
        </div>
      </header>

      <section className="atenciones-metricas">
        <article className="atencion-metrica">
          <span>Total de atenciones</span>
          <strong>{atenciones.length}</strong>
          <small>Registros cargados</small>
        </article>

        <article className="atencion-metrica">
          <span>En proceso</span>
          <strong>{enProceso}</strong>
          <small>Sin fecha de finalización</small>
        </article>

        <article className="atencion-metrica">
          <span>Finalizadas</span>
          <strong>{finalizadas}</strong>
          <small>Con fecha de finalización</small>
        </article>

        <article className="atencion-metrica">
          <span>Oficinas involucradas</span>
          <strong>{oficinas}</strong>
          <small>Con registros cargados</small>
        </article>
      </section>

      <section className="atenciones-panel">
        <div className="atenciones-panel-header">
          <div>
            <h2>Registro de atenciones</h2>
            <p>
              Busca por ticket, incidencia, oficina o responsable.
            </p>
          </div>

          <span className="atenciones-contador">
            {filtradas.length} registros
          </span>
        </div>

        <div className="atenciones-filtros">
          <label className="atenciones-busqueda">
            <span aria-hidden="true">⌕</span>
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar una atención..."
              aria-label="Buscar atención"
            />
          </label>

          <select
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(event.target.value as EstadoFiltro)
            }
            aria-label="Filtrar por estado"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="EN PROCESO">En proceso</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>

        {cargando ? (
          <div className="atenciones-vacio">
            <p>Cargando atenciones desde la base de datos...</p>
          </div>
        ) : error ? (
          <div className="atenciones-sin-resultados" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="atencion-btn-detalle"
              onClick={() => void recargar()}
            >
              Reintentar
            </button>
          </div>
        ) : atenciones.length === 0 ? (
          <div className="atenciones-vacio">
            <div className="atenciones-vacio-icono">▤</div>
            <h3>No hay atenciones registradas</h3>
            <p>
              La consulta se realizó correctamente, pero no se
              encontraron registros de atención.
            </p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="atenciones-sin-resultados">
            No se encontraron atenciones con esos filtros.
          </div>
        ) : (
          <div className="table-responsive atenciones-tabla-wrapper">
            <table className="table atenciones-tabla align-middle">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Incidencia</th>
                  <th>Oficina</th>
                  <th>Responsable</th>
                  <th>Inicio</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.map((atencion) => (
                  <tr key={atencion.id_atencion}>
                    <td>
                      <strong>
                        {atencion.codigo_ticket ||
                          `Ticket #${atencion.id_ticket}`}
                      </strong>
                    </td>

                    <td>
                      {atencion.codigo_incidencia || '—'}
                    </td>

                    <td>{atencion.oficina || '—'}</td>

                    <td>{atencion.usuario || '—'}</td>

                    <td>{fechaLegible(atencion.fecha_inicio)}</td>

                    <td>
                      <span
                        className={`atencion-estado ${
                          atencion.fecha_fin
                            ? 'atencion-estado-finalizada'
                            : 'atencion-estado-proceso'
                        }`}
                      >
                        {estadoAtencion(atencion)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="atencion-btn-detalle"
                        onClick={() => setDetalle(atencion)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detalle && (
        <div
          className="atencion-modal-fondo"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetalle(null)
            }
          }}
        >
          <section
            className="atencion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="atencion-detalle-titulo"
          >
            <header>
              <div>
                <span className="atenciones-eyebrow">
                  CONSULTA DE REGISTRO
                </span>

                <h2 id="atencion-detalle-titulo">
                  {detalle.codigo_ticket ||
                    `Atención #${detalle.id_atencion}`}
                </h2>
              </div>

              <button
                type="button"
                className="atencion-modal-cerrar"
                onClick={() => setDetalle(null)}
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </header>

            <dl className="atencion-detalle-grid">
              <div>
                <dt>Ticket</dt>
                <dd>
                  {detalle.codigo_ticket ||
                    `#${detalle.id_ticket}`}
                </dd>
              </div>

              <div>
                <dt>Código de incidencia</dt>
                <dd>{detalle.codigo_incidencia || '—'}</dd>
              </div>

              <div>
                <dt>Estado del ticket</dt>
                <dd>{detalle.estado_ticket || '—'}</dd>
              </div>

              <div>
                <dt>Estado de atención</dt>
                <dd>{estadoAtencion(detalle)}</dd>
              </div>

              <div>
                <dt>Oficina</dt>
                <dd>{detalle.oficina || '—'}</dd>
              </div>

              <div>
                <dt>Responsable</dt>
                <dd>{detalle.usuario || '—'}</dd>
              </div>

              <div>
                <dt>Fecha de inicio</dt>
                <dd>{fechaLegible(detalle.fecha_inicio)}</dd>
              </div>

              <div>
                <dt>Última actualización</dt>
                <dd>{fechaLegible(detalle.fecha_actualizacion)}</dd>
              </div>

              <div>
                <dt>Fecha de finalización</dt>
                <dd>{fechaLegible(detalle.fecha_fin)}</dd>
              </div>

              <div className="atencion-detalle-completo">
                <dt>Descripción de atención</dt>
                <dd>
                  {detalle.descripcion_atencion ||
                    'Sin descripción registrada.'}
                </dd>
              </div>

              <div className="atencion-detalle-completo">
                <dt>Resultado</dt>
                <dd>
                  {detalle.resultado || 'Sin resultado registrado.'}
                </dd>
              </div>

              <div className="atencion-detalle-completo">
                <dt>Conclusiones</dt>
                <dd>
                  {detalle.conclusion || 'Sin conclusiones registradas.'}
                </dd>
              </div>
            </dl>

            <footer>
              <span>Vista de solo lectura</span>
              <button
                type="button"
                className="atencion-btn-detalle"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}
