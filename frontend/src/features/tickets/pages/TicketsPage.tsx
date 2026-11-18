
import { useEffect, useMemo, useState } from 'react'
import { useTickets } from '../hooks/useTickets'
import type { AttentionMode, TicketListItem } from '../types/ticket.types'
import './tickets.css'

const normalizar = (valor: string) =>
  valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const fecha = (valor: string | null) => {
  if (!valor) return '—'

  const parsed = new Date(valor)

  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('es-PE')
}

const claseEstado = (estado: string) => {
  const value = normalizar(estado)

  if (value.includes('resuelto') || value.includes('cerrado')) return 'success'
  if (value.includes('atencion') || value.includes('proceso')) return 'info'
  if (value.includes('asignado')) return 'primary'

  return 'warning'
}

export default function TicketsPage() {
  const {
    tickets,
    selectedTicket,
    loading,
    savingMode,
    error,
    loadTickets,
    loadTicketById,
    changeAttentionMode,
    setSelectedTicket,
  } = useTickets()

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [prioridadFiltro, setPrioridadFiltro] = useState('')
  const [detalleLoading, setDetalleLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null)

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const estados = useMemo(
    () =>
      [...new Set(tickets.map((ticket) => ticket.estado).filter(Boolean))].sort(),
    [tickets]
  )

  const prioridades = useMemo(
    () =>
      [...new Set(tickets.map((ticket) => ticket.prioridad).filter(Boolean))].sort(),
    [tickets]
  )

  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda)

    return tickets.filter((ticket: TicketListItem) => {
      const contenido = normalizar(
        [
          ticket.codigo_ticket,
          ticket.codigo_incidencia,
          ticket.titulo,
          ticket.categoria,
          ticket.oficina,
        ].join(' ')
      )

      return (
        (!texto || contenido.includes(texto)) &&
        (!estadoFiltro || ticket.estado === estadoFiltro) &&
        (!prioridadFiltro || ticket.prioridad === prioridadFiltro)
      )
    })
  }, [tickets, busqueda, estadoFiltro, prioridadFiltro])

  const abrirDetalle = async (id: number) => {
    setDetalleLoading(true)
    setErrorDetalle(null)
    setMensaje(null)

    try {
      await loadTicketById(id)
    } catch {
      setErrorDetalle('No se pudo consultar el detalle del ticket.')
    } finally {
      setDetalleLoading(false)
    }
  }

  const elegirModalidad = async (modalidad: AttentionMode) => {
    if (!selectedTicket || savingMode) return

    const confirmacion = window.confirm(
      modalidad === 'ATENCION_DIRECTA'
        ? '¿Confirmas la atención directa? Se creará una asignación automática a la oficina responsable.'
        : '¿Confirmas que deseas registrar la modalidad de solicitud administrativa para este ticket?'
    )

    if (!confirmacion) return

    setErrorDetalle(null)
    setMensaje(null)

    try {
      await changeAttentionMode(selectedTicket.id_ticket, modalidad)
      setMensaje('La modalidad fue procesada correctamente.')
    } catch {
      setErrorDetalle(
        'No se pudo procesar la modalidad. Verifica el estado del ticket antes de volver a intentarlo.'
      )
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setEstadoFiltro('')
    setPrioridadFiltro('')
  }

  const contar = (buscar: string) =>
    tickets.filter((ticket) => normalizar(ticket.estado).includes(buscar)).length

  const cerrarDetalle = () => {
    if (savingMode) return

    setSelectedTicket(null)
    setErrorDetalle(null)
    setMensaje(null)
  }

  return (
    <section className="tickets-page">
      <header className="tickets-header">
        <div>
          <div className="tickets-breadcrumb">Gestión / Tickets</div>
          <h1>Gestión de tickets</h1>
          <p>
            Consulta los tickets generados a partir de incidencias urbanas validadas.
          </p>
        </div>

        <button
          type="button"
          className="tickets-button tickets-button-secondary"
          onClick={() => void loadTickets()}
          disabled={loading}
        >
          {loading ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </header>

      <div className="tickets-summary">
        <article className="tickets-summary-card">
          <span>Total de tickets</span>
          <strong>{tickets.length}</strong>
        </article>

        <article className="tickets-summary-card">
          <span>Pendientes de asignación</span>
          <strong>{contar('pendiente de asignacion')}</strong>
        </article>

        <article className="tickets-summary-card">
          <span>Asignados</span>
          <strong>{contar('asignado')}</strong>
        </article>

        <article className="tickets-summary-card">
          <span>Resueltos</span>
          <strong>{contar('resuelto') + contar('cerrado')}</strong>
        </article>
      </div>

      <section className="tickets-panel">
        <div className="tickets-panel-heading">
          <div>
            <h2>Listado de tickets</h2>
            <p>Busca, filtra y consulta el detalle de cada ticket.</p>
          </div>

          <span>{filtrados.length} resultado(s)</span>
        </div>

        <div className="tickets-filters">
          <input
            aria-label="Buscar tickets"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por código, incidencia, título u oficina…"
          />

          <select
            aria-label="Filtrar por estado"
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por prioridad"
            value={prioridadFiltro}
            onChange={(event) => setPrioridadFiltro(event.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {prioridades.map((prioridad) => (
              <option key={prioridad} value={prioridad}>
                {prioridad}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="tickets-button tickets-button-secondary"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>

        {error && (
          <div className="tickets-alert tickets-alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="tickets-table-wrap">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Incidencia</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Modalidad</th>
                <th>Oficina</th>
                <th>Creación</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="tickets-empty">
                    Cargando tickets…
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="tickets-empty">
                    {error
                      ? 'No fue posible cargar los tickets.'
                      : 'No hay tickets que coincidan con la búsqueda.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((ticket) => (
                  <tr key={ticket.id_ticket}>
                    <td>
                      <strong>{ticket.codigo_ticket}</strong>
                    </td>

                    <td>
                      <strong>{ticket.codigo_incidencia}</strong>
                      <small>{ticket.titulo}</small>
                    </td>

                    <td>{ticket.categoria}</td>
                    <td>{ticket.prioridad}</td>

                    <td>
                      <span
                        className={`tickets-badge tickets-badge-${claseEstado(ticket.estado)}`}
                      >
                        {ticket.estado}
                      </span>
                    </td>

                    <td>
                      {ticket.modalidad_atencion === 'ATENCION_DIRECTA'
                        ? 'Atención directa'
                        : ticket.modalidad_atencion === 'SOLICITUD_ADMINISTRATIVA'
                          ? 'Solicitud administrativa'
                          : 'Sin seleccionar'}
                    </td>

                    <td>{ticket.oficina}</td>
                    <td>{fecha(ticket.fecha_creacion)}</td>

                    <td>
                      <button
                        type="button"
                        className="tickets-button tickets-button-primary"
                        onClick={() => void abrirDetalle(ticket.id_ticket)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(selectedTicket || detalleLoading || errorDetalle) && (
        <div
          className="tickets-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarDetalle()
          }}
        >
          <section
            className="tickets-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tickets-detail-title"
          >
            <header className="tickets-modal-header">
              <div>
                <span className="tickets-breadcrumb">Detalle del ticket</span>
                <h2 id="tickets-detail-title">
                  {selectedTicket?.codigo_ticket ?? 'Consultando ticket…'}
                </h2>
              </div>

              <button
                type="button"
                className="tickets-modal-close"
                aria-label="Cerrar detalle"
                disabled={savingMode}
                onClick={cerrarDetalle}
              >
                ×
              </button>
            </header>

            {detalleLoading && (
              <p className="tickets-detail-loading">
                Consultando información del ticket…
              </p>
            )}

            {errorDetalle && (
              <div className="tickets-alert tickets-alert-error" role="alert">
                {errorDetalle}
              </div>
            )}

            {mensaje && (
              <div className="tickets-alert tickets-alert-success" role="status">
                {mensaje}
              </div>
            )}

            {selectedTicket && (
              <>
                <dl className="tickets-detail-grid">
                  <div>
                    <dt>Incidencia</dt>
                    <dd>{selectedTicket.codigo_incidencia}</dd>
                  </div>

                  <div>
                    <dt>Título</dt>
                    <dd>{selectedTicket.titulo}</dd>
                  </div>

                  <div>
                    <dt>Estado</dt>
                    <dd>
                      <span
                        className={`tickets-badge tickets-badge-${claseEstado(selectedTicket.estado)}`}
                      >
                        {selectedTicket.estado}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt>Prioridad</dt>
                    <dd>{selectedTicket.prioridad}</dd>
                  </div>

                  <div>
                    <dt>Categoría</dt>
                    <dd>{selectedTicket.categoria}</dd>
                  </div>

                  <div>
                    <dt>Oficina responsable</dt>
                    <dd>{selectedTicket.oficina}</dd>
                  </div>

                  <div>
                    <dt>Fecha de creación</dt>
                    <dd>{fecha(selectedTicket.fecha_creacion)}</dd>
                  </div>

                  <div>
                    <dt>Fecha límite</dt>
                    <dd>{fecha(selectedTicket.fecha_limite)}</dd>
                  </div>

                  <div className="tickets-detail-full">
                    <dt>Dirección</dt>
                    <dd>{selectedTicket.direccion_texto || 'No registrada'}</dd>
                  </div>

                  <div className="tickets-detail-full">
                    <dt>Descripción</dt>
                    <dd>{selectedTicket.descripcion || 'Sin descripción'}</dd>
                  </div>
                </dl>

                {selectedTicket.modalidad_atencion === null &&
                  normalizar(selectedTicket.estado) ===
                    'pendiente de asignacion' && (
                    <div className="tickets-mode-section">
                      <div className="tickets-mode-heading">
                        <span className="tickets-mode-heading-icon" aria-hidden="true">
                          <i className="bi bi-signpost-split" />
                        </span>

                        <div>
                          <h3>Seleccionar modalidad de atención</h3>
                          <p>
                            Elige cómo se gestionará este ticket para continuar
                            con el procedimiento correspondiente.
                          </p>
                        </div>
                      </div>

                      <div className="tickets-mode-cards">
                        <article className="tickets-mode-card tickets-mode-card-direct">
                          <div className="tickets-mode-card-top">
                            <span className="tickets-mode-icon" aria-hidden="true">
                              <i className="bi bi-building-check" />
                            </span>

                            <span className="tickets-mode-tag">
                              Derivación directa
                            </span>
                          </div>

                          <h4>Atención directa</h4>

                          <p>
                            Deriva el ticket a la oficina responsable para que
                            pueda recibirlo y comenzar su atención.
                          </p>

                          <ul className="tickets-mode-benefits">
                            <li>
                              <i className="bi bi-check-circle-fill" aria-hidden="true" />
                              <span>Asignación a la oficina responsable</span>
                            </li>
                            <li>
                              <i className="bi bi-check-circle-fill" aria-hidden="true" />
                              <span>Seguimiento del proceso de atención</span>
                            </li>
                          </ul>

                          <button
                            type="button"
                            className="tickets-mode-action tickets-mode-action-direct"
                            disabled={savingMode}
                            onClick={() =>
                              void elegirModalidad('ATENCION_DIRECTA')
                            }
                          >
                            <i className="bi bi-arrow-right-circle" aria-hidden="true" />
                            Elegir atención directa
                          </button>
                        </article>

                        <article className="tickets-mode-card tickets-mode-card-saiu">
                          <div className="tickets-mode-card-top">
                            <span className="tickets-mode-icon" aria-hidden="true">
                              <i className="bi bi-file-earmark-text" />
                            </span>

                            <span className="tickets-mode-tag">
                              Trámite documental
                            </span>
                          </div>

                          <h4>Solicitud administrativa</h4>

                          <p>
                            Registra la modalidad administrativa para que la
                            solicitud correspondiente pueda consultarse desde
                            el módulo SAIU.
                          </p>

                          <ul className="tickets-mode-benefits">
                            <li>
                              <i className="bi bi-check-circle-fill" aria-hidden="true" />
                              <span>Registro de la modalidad seleccionada</span>
                            </li>
                            <li>
                              <i className="bi bi-check-circle-fill" aria-hidden="true" />
                              <span>Consulta independiente desde SAIU</span>
                            </li>
                          </ul>

                          <button
                            type="button"
                            className="tickets-mode-action tickets-mode-action-saiu"
                            disabled={savingMode}
                            onClick={() =>
                              void elegirModalidad('SOLICITUD_ADMINISTRATIVA')
                            }
                          >
                            <i className="bi bi-file-earmark-check" aria-hidden="true" />
                            Elegir solicitud administrativa
                          </button>
                        </article>
                      </div>

                      {savingMode && (
                        <div className="tickets-mode-processing" role="status">
                          <span
                            className="tickets-mode-spinner"
                            aria-hidden="true"
                          />
                          Procesando la modalidad seleccionada…
                        </div>
                      )}
                    </div>
                  )}

                {selectedTicket.modalidad_atencion !== null && (
                  <div className="tickets-mode-selected">
                    <span className="tickets-mode-selected-icon" aria-hidden="true">
                      <i
                        className={
                          selectedTicket.modalidad_atencion === 'ATENCION_DIRECTA'
                            ? 'bi bi-building-check'
                            : 'bi bi-file-earmark-check'
                        }
                      />
                    </span>

                    <div>
                      <span className="tickets-mode-selected-label">
                        Modalidad registrada
                      </span>
                      <strong>
                        {selectedTicket.modalidad_atencion === 'ATENCION_DIRECTA'
                          ? 'Atención directa'
                          : 'Solicitud administrativa'}
                      </strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
