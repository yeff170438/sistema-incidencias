
import { useEffect, useMemo, useState } from 'react'
import {
  getHistorialIncidencias,
  type IncidenciaCiudadano,
} from '../api/ciudadanos.api'
import { useCiudadanos } from '../hooks/useCiudadanos'
import type {
  Ciudadano,
  ActualizarCiudadanoPayload,
  FiltroVerificacion,
} from '../types/ciudadano.types'
import './ciudadanos.css'

type VistaModal = 'detalle' | 'editar' | 'historial' | null
type FiltroEstado = 'todos' | 'pendiente' | 'en_proceso' | 'atendida' | 'rechazada'
type FiltroPrioridad = 'todas' | 'baja' | 'media' | 'alta' | 'critica'

const normalizar = (valor: string | null | undefined) =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .trim()

function fechaLegible(fecha: string | null | undefined): string {
  if (!fecha) return 'Sin fecha'
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(valor)
}

function textoEstado(estado: string | null | undefined): string {
  const valor = normalizar(estado)
  if (!valor) return 'Sin estado'
  if (valor.includes('pendiente')) return 'Pendiente'
  if (valor.includes('proceso')) return 'En proceso'
  if (valor.includes('observad')) return 'Observada'
  if (valor.includes('rechaz')) return 'Rechazada'
  if (valor.includes('atendid') || valor.includes('resuelt') || valor.includes('cerrad')) {
    return 'Atendida'
  }
  if (valor.includes('valid')) return 'Validada'
  return valor.charAt(0).toUpperCase() + valor.slice(1)
}

function claseEstado(estado: string | null | undefined): string {
  const valor = normalizar(estado)
  if (valor.includes('rechaz')) return 'estado-rechazada'
  if (valor.includes('atendid') || valor.includes('resuelt') || valor.includes('cerrad')) {
    return 'estado-atendida'
  }
  if (valor.includes('proceso')) return 'estado-proceso'
  if (valor.includes('observad')) return 'estado-observada'
  if (valor.includes('valid')) return 'estado-validada'
  return 'estado-pendiente'
}

function textoPrioridad(prioridad: string | null | undefined): string {
  if (!prioridad) return 'Sin prioridad'
  const valor = normalizar(prioridad)
  if (valor.includes('crit')) return 'Crítica'
  return valor.charAt(0).toUpperCase() + valor.slice(1)
}

function clasePrioridad(prioridad: string | null | undefined): string {
  const valor = normalizar(prioridad)
  if (valor.includes('crit')) return 'prioridad-critica'
  if (valor.includes('alta')) return 'prioridad-alta'
  if (valor.includes('media')) return 'prioridad-media'
  if (valor.includes('baja')) return 'prioridad-baja'
  return 'prioridad-sin-dato'
}

function nombreCompleto(ciudadano: Ciudadano): string {
  return [
    ciudadano.nombres,
    ciudadano.apellido_paterno,
    ciudadano.apellido_materno,
  ].filter(Boolean).join(' ')
}

const formularioInicial: ActualizarCiudadanoPayload = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
  direccion: '',
}

export default function CiudadanosPage() {
  const {
    ciudadanos,
    loading,
    saving,
    error,
    setError,
    loadCiudadanos,
    update,
  } = useCiudadanos()

  const [busqueda, setBusqueda] = useState('')
  const [filtroVerificacion, setFiltroVerificacion] =
    useState<FiltroVerificacion>('todos')
  const [modal, setModal] = useState<VistaModal>(null)
  const [seleccionado, setSeleccionado] = useState<Ciudadano | null>(null)
  const [formulario, setFormulario] =
    useState<ActualizarCiudadanoPayload>(formularioInicial)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const [incidencias, setIncidencias] = useState<IncidenciaCiudadano[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null)
  const [busquedaHistorial, setBusquedaHistorial] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [filtroPrioridad, setFiltroPrioridad] =
    useState<FiltroPrioridad>('todas')
  const [incidenciaActiva, setIncidenciaActiva] =
    useState<IncidenciaCiudadano | null>(null)

  useEffect(() => {
    void loadCiudadanos()
  }, [loadCiudadanos])

  const ciudadanosFiltrados = useMemo(() => {
    const termino = normalizar(busqueda)

    return ciudadanos.filter((ciudadano) => {
      const texto = normalizar([
        ciudadano.dni,
        nombreCompleto(ciudadano),
        ciudadano.correo,
        ciudadano.telefono,
      ].filter(Boolean).join(' '))

      const coincideBusqueda = !termino || texto.includes(termino)
      const verificado = Boolean(ciudadano.correo_verificado)

      const coincideVerificacion =
        filtroVerificacion === 'todos' ||
        (filtroVerificacion === 'verificados' && verificado) ||
        (filtroVerificacion === 'pendientes' && !verificado)

      return coincideBusqueda && coincideVerificacion
    })
  }, [ciudadanos, busqueda, filtroVerificacion])

  const incidenciasFiltradas = useMemo(() => {
    const termino = normalizar(busquedaHistorial)

    return incidencias.filter((incidencia) => {
      const texto = normalizar([
        incidencia.codigo_incidencia,
        incidencia.titulo,
        incidencia.descripcion,
        incidencia.direccion_texto,
        incidencia.categoria,
      ].filter(Boolean).join(' '))

      const coincideBusqueda = !termino || texto.includes(termino)
      const estado = normalizar(incidencia.estado)
      const prioridad = normalizar(incidencia.prioridad)

      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'pendiente' && estado.includes('pendiente')) ||
        (filtroEstado === 'en_proceso' && estado.includes('proceso')) ||
        (filtroEstado === 'atendida' &&
          (estado.includes('atendid') ||
            estado.includes('resuelt') ||
            estado.includes('cerrad'))) ||
        (filtroEstado === 'rechazada' && estado.includes('rechaz'))

      const coincidePrioridad =
        filtroPrioridad === 'todas' ||
        prioridad.includes(filtroPrioridad === 'critica' ? 'crit' : filtroPrioridad)

      return coincideBusqueda && coincideEstado && coincidePrioridad
    })
  }, [incidencias, busquedaHistorial, filtroEstado, filtroPrioridad])

  const totalVerificados = ciudadanos.filter(
    (ciudadano) => Boolean(ciudadano.correo_verificado),
  ).length

  const totalPendientes = ciudadanos.length - totalVerificados

  const abrirDetalle = (ciudadano: Ciudadano) => {
    setSeleccionado(ciudadano)
    setMensaje(null)
    setError(null)
    setModal('detalle')
  }

  const abrirEdicion = (ciudadano: Ciudadano) => {
    setSeleccionado(ciudadano)
    setFormulario({
      nombres: ciudadano.nombres ?? '',
      apellido_paterno: ciudadano.apellido_paterno ?? '',
      apellido_materno: ciudadano.apellido_materno ?? '',
      correo: ciudadano.correo ?? '',
      telefono: ciudadano.telefono ?? '',
      direccion: ciudadano.direccion ?? '',
    })
    setMensaje(null)
    setError(null)
    setModal('editar')
  }

  const abrirHistorial = async (ciudadano: Ciudadano) => {
    setSeleccionado(ciudadano)
    setModal('historial')
    setIncidencias([])
    setIncidenciaActiva(null)
    setBusquedaHistorial('')
    setFiltroEstado('todos')
    setFiltroPrioridad('todas')
    setErrorHistorial(null)
    setCargandoHistorial(true)

    try {
      const datos = await getHistorialIncidencias(ciudadano.id_ciudadano)
      setIncidencias(Array.isArray(datos) ? datos : [])
    } catch (err) {
      const errorApi = err as {
        response?: { data?: { message?: string } }
        message?: string
      }
      setErrorHistorial(
        errorApi.response?.data?.message ??
          errorApi.message ??
          'No se pudo cargar el historial de incidencias.',
      )
    } finally {
      setCargandoHistorial(false)
    }
  }

  const cerrarModal = () => {
    setModal(null)
    setSeleccionado(null)
    setIncidenciaActiva(null)
    setMensaje(null)
    setError(null)
    setErrorHistorial(null)
  }

  const cambiarCampo = (
    campo: keyof ActualizarCiudadanoPayload,
    valor: string,
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  const guardarCambios = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!seleccionado) return

    const payload: ActualizarCiudadanoPayload = {
      ...formulario,
      nombres: formulario.nombres.trim(),
      apellido_paterno: formulario.apellido_paterno.trim(),
      apellido_materno: formulario.apellido_materno.trim(),
      correo: formulario.correo.trim(),
      telefono: formulario.telefono?.trim() || null,
      direccion: formulario.direccion?.trim() || null,
    }

    const actualizado = await update(seleccionado.id_ciudadano, payload)

    if (actualizado) {
      setMensaje('Los datos del ciudadano se actualizaron correctamente.')
      await loadCiudadanos()
      setModal(null)
      setSeleccionado(null)
      setMensaje(null)
    }
  }

  return (
    <main className="ciudadanos-page">
      <header className="ciudadanos-header">
        <div className="ciudadanos-heading">
          <span className="ciudadanos-eyebrow">GESTIÓN MUNICIPAL</span>
          <h1>Gestión de ciudadanos</h1>
          <p>
            Consulta los datos de registro, administra la información y revisa
            el historial de incidencias reportadas.
          </p>
        </div>

        <button
          className="ciudadanos-btn ciudadanos-btn-secondary"
          type="button"
          onClick={() => void loadCiudadanos()}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span>
          {loading ? 'Actualizando…' : 'Actualizar lista'}
        </button>
      </header>

      {error && (
        <div className="ciudadanos-alert ciudadanos-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Cerrar mensaje">
            ×
          </button>
        </div>
      )}

      {mensaje && (
        <div className="ciudadanos-alert ciudadanos-alert-success" role="status">
          {mensaje}
        </div>
      )}

      <section className="ciudadanos-stats" aria-label="Resumen de ciudadanos">
        <article className="ciudadanos-stat">
          <div className="stat-icon stat-icon-blue" aria-hidden="true">♙</div>
          <div>
            <span className="stat-label">Total de ciudadanos</span>
            <strong>{ciudadanos.length}</strong>
            <small>Registros disponibles</small>
          </div>
        </article>

        <article className="ciudadanos-stat">
          <div className="stat-icon stat-icon-green" aria-hidden="true">✓</div>
          <div>
            <span className="stat-label">Correo verificado</span>
            <strong>{totalVerificados}</strong>
            <small>Identidades con correo verificado</small>
          </div>
        </article>

        <article className="ciudadanos-stat">
          <div className="stat-icon stat-icon-amber" aria-hidden="true">◷</div>
          <div>
            <span className="stat-label">Pendientes de verificación</span>
            <strong>{totalPendientes}</strong>
            <small>Requieren seguimiento</small>
          </div>
        </article>
      </section>

      <section className="ciudadanos-panel">
        <div className="ciudadanos-panel-heading">
          <div>
            <h2>Directorio de ciudadanos</h2>
            <p>Busca un registro para consultar sus datos o sus incidencias.</p>
          </div>
          <span className="ciudadanos-count">
            {ciudadanosFiltrados.length} resultados
          </span>
        </div>

        <div className="ciudadanos-toolbar">
          <label className="ciudadanos-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por DNI, nombre o correo…"
              aria-label="Buscar ciudadanos"
            />
            {busqueda && (
              <button type="button" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
                ×
              </button>
            )}
          </label>

          <label className="ciudadanos-filter">
            <span>Verificación</span>
            <select
              value={filtroVerificacion}
              onChange={(event) =>
                setFiltroVerificacion(event.target.value as FiltroVerificacion)
              }
            >
              <option value="todos">Todos los registros</option>
              <option value="verificados">Correo verificado</option>
              <option value="pendientes">Pendientes</option>
            </select>
          </label>
        </div>

        <div className="ciudadanos-table-wrap">
          <table className="ciudadanos-table">
            <thead>
              <tr>
                <th>Ciudadano</th>
                <th>DNI</th>
                <th>Contacto</th>
                <th>Verificación</th>
                <th>Registro</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && ciudadanos.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="ciudadanos-empty">
                      <span className="ciudadanos-loader" />
                      <strong>Cargando ciudadanos</strong>
                      <p>Estamos recuperando los registros.</p>
                    </div>
                  </td>
                </tr>
              ) : ciudadanosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="ciudadanos-empty">
                      <span className="empty-symbol" aria-hidden="true">⌕</span>
                      <strong>No se encontraron ciudadanos</strong>
                      <p>Prueba con otro término o cambia el filtro de verificación.</p>
                      <button
                        type="button"
                        className="ciudadanos-btn ciudadanos-btn-secondary"
                        onClick={() => {
                          setBusqueda('')
                          setFiltroVerificacion('todos')
                        }}
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ciudadanosFiltrados.map((ciudadano) => (
                  <tr key={ciudadano.id_ciudadano}>
                    <td>
                      <div className="ciudadano-identity">
                        <div className="ciudadano-avatar" aria-hidden="true">
                          {(ciudadano.nombres?.trim().charAt(0) || 'C').toUpperCase()}
                          {(ciudadano.apellido_paterno?.trim().charAt(0) || '').toUpperCase()}
                        </div>
                        <div className="ciudadano-identity-text">
                          <strong>{nombreCompleto(ciudadano)}</strong>
                          <span>ID #{ciudadano.id_ciudadano}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ciudadano-dni">{ciudadano.dni}</span>
                    </td>
                    <td>
                      <div className="ciudadano-contact">
                        <span title={ciudadano.correo}>✉ {ciudadano.correo || 'Sin correo'}</span>
                        <span>☎ {ciudadano.telefono || 'Sin teléfono'}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ciudadanos-badge ${
                          ciudadano.correo_verificado
                            ? 'badge-verificado'
                            : 'badge-pendiente'
                        }`}
                      >
                        <span className="badge-dot" />
                        {ciudadano.correo_verificado ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className="ciudadano-date">
                        {fechaLegible(ciudadano.fecha_registro)}
                      </span>
                    </td>
                    <td>
                      <div className="ciudadano-actions">
                        <button
                          type="button"
                          className="action-button action-view"
                          onClick={() => abrirDetalle(ciudadano)}
                          title="Ver detalles"
                          aria-label={`Ver detalles de ${nombreCompleto(ciudadano)}`}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="action-button action-edit"
                          onClick={() => abrirEdicion(ciudadano)}
                          title="Editar ciudadano"
                          aria-label={`Editar a ${nombreCompleto(ciudadano)}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="action-button action-history"
                          onClick={() => void abrirHistorial(ciudadano)}
                          title="Ver historial de incidencias"
                          aria-label={`Historial de ${nombreCompleto(ciudadano)}`}
                        >
                          Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="ciudadanos-table-footer">
          <span>
            Mostrando <strong>{ciudadanosFiltrados.length}</strong> de{' '}
            <strong>{ciudadanos.length}</strong> ciudadanos
          </span>
          <span className="table-footer-note">Gestión de registros municipales</span>
        </footer>
      </section>

      {modal && seleccionado && (
        <div
          className="ciudadanos-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal()
          }}
        >
          <section
            className={`ciudadanos-modal ${
              modal === 'historial' ? 'ciudadanos-modal-history' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ciudadanos-modal-title"
          >
            <header className="ciudadanos-modal-header">
              <div className="modal-title-group">
                <span className="ciudadanos-eyebrow">
                  {modal === 'historial'
                    ? 'SEGUIMIENTO DE CASOS'
                    : modal === 'editar'
                      ? 'ACTUALIZACIÓN DE REGISTRO'
                      : 'INFORMACIÓN DEL REGISTRO'}
                </span>
                <h2 id="ciudadanos-modal-title">
                  {modal === 'historial'
                    ? 'Historial de incidencias'
                    : modal === 'editar'
                      ? 'Editar ciudadano'
                      : 'Detalle del ciudadano'}
                </h2>
                <p>{nombreCompleto(seleccionado)} · DNI {seleccionado.dni}</p>
              </div>
              <button
                type="button"
                className="ciudadanos-modal-close"
                onClick={cerrarModal}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </header>

            {modal === 'detalle' && (
              <div className="ciudadanos-modal-body">
                <div className="detail-profile">
                  <div className="ciudadano-avatar ciudadano-avatar-large" aria-hidden="true">
                    {(seleccionado.nombres?.trim().charAt(0) || 'C').toUpperCase()}
                    {(seleccionado.apellido_paterno?.trim().charAt(0) || '').toUpperCase()}
                  </div>
                  <div>
                    <h3>{nombreCompleto(seleccionado)}</h3>
                    <p>Ciudadano registrado en el sistema</p>
                    <span
                      className={`ciudadanos-badge ${
                        seleccionado.correo_verificado
                          ? 'badge-verificado'
                          : 'badge-pendiente'
                      }`}
                    >
                      <span className="badge-dot" />
                      {seleccionado.correo_verificado
                        ? 'Correo verificado'
                        : 'Correo pendiente de verificación'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Información personal</h3>
                  <div className="ciudadanos-detail-grid">
                    <DetailItem label="DNI" value={seleccionado.dni} />
                    <DetailItem label="Nombres" value={seleccionado.nombres} />
                    <DetailItem label="Apellido paterno" value={seleccionado.apellido_paterno} />
                    <DetailItem label="Apellido materno" value={seleccionado.apellido_materno} />
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Información de contacto</h3>
                  <div className="ciudadanos-detail-grid">
                    <DetailItem label="Correo electrónico" value={seleccionado.correo} />
                    <DetailItem label="Teléfono" value={seleccionado.telefono} />
                    <DetailItem label="Dirección" value={seleccionado.direccion} />
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Actividad de la cuenta</h3>
                  <div className="ciudadanos-detail-grid">
                    <DetailItem
                      label="Fecha de registro"
                      value={fechaLegible(seleccionado.fecha_registro)}
                    />
                    <DetailItem
                      label="Último acceso"
                      value={fechaLegible(seleccionado.ultimo_acceso)}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="ciudadanos-btn ciudadanos-btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="ciudadanos-btn ciudadanos-btn-primary"
                    onClick={() => abrirEdicion(seleccionado)}
                  >
                    Editar información
                  </button>
                  <button
                    type="button"
                    className="ciudadanos-btn ciudadanos-btn-history"
                    onClick={() => void abrirHistorial(seleccionado)}
                  >
                    Ver incidencias
                  </button>
                </div>
              </div>
            )}

            {modal === 'editar' && (
              <form className="ciudadanos-modal-body" onSubmit={guardarCambios}>
                <div className="form-intro">
                  <span className="form-info-icon" aria-hidden="true">i</span>
                  <p>
                    Actualiza los datos de contacto y la información personal.
                    El DNI se mantiene como identificador del registro.
                  </p>
                </div>

                <div className="ciudadanos-form-grid">
                  <FormField
                    label="Nombres"
                    value={formulario.nombres}
                    onChange={(value) => cambiarCampo('nombres', value)}
                    required
                  />
                  <FormField
                    label="Apellido paterno"
                    value={formulario.apellido_paterno}
                    onChange={(value) => cambiarCampo('apellido_paterno', value)}
                    required
                  />
                  <FormField
                    label="Apellido materno"
                    value={formulario.apellido_materno}
                    onChange={(value) => cambiarCampo('apellido_materno', value)}
                    required
                  />
                  <FormField
                    label="Correo electrónico"
                    value={formulario.correo}
                    onChange={(value) => cambiarCampo('correo', value)}
                    type="email"
                    required
                  />
                  <FormField
                    label="Teléfono"
                    value={formulario.telefono ?? ''}
                    onChange={(value) => cambiarCampo('telefono', value)}
                    type="tel"
                  />
                  <label className="ciudadanos-field ciudadanos-field-full">
                    <span>Dirección</span>
                    <textarea
                      rows={3}
                      value={formulario.direccion ?? ''}
                      onChange={(event) => cambiarCampo('direccion', event.target.value)}
                      placeholder="Dirección actual del ciudadano"
                    />
                  </label>
                </div>

                {error && (
                  <div className="ciudadanos-alert ciudadanos-alert-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="ciudadanos-btn ciudadanos-btn-secondary"
                    onClick={cerrarModal}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ciudadanos-btn ciudadanos-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}

            {modal === 'historial' && (
              <div className="ciudadanos-modal-body historial-body">
                <div className="history-profile">
                  <div className="ciudadano-avatar ciudadano-avatar-large" aria-hidden="true">
                    {(seleccionado.nombres?.trim().charAt(0) || 'C').toUpperCase()}
                    {(seleccionado.apellido_paterno?.trim().charAt(0) || '').toUpperCase()}
                  </div>
                  <div className="history-profile-main">
                    <strong>{nombreCompleto(seleccionado)}</strong>
                    <span>DNI {seleccionado.dni}</span>
                    <span>{seleccionado.correo}</span>
                  </div>
                  <div className="history-total">
                    <strong>{cargandoHistorial ? '—' : incidencias.length}</strong>
                    <span>Incidencias</span>
                  </div>
                </div>

                {!cargandoHistorial && !errorHistorial && (
                  <div className="history-summary">
                    <div className="history-summary-card">
                      <span className="summary-marker summary-marker-blue" />
                      <div>
                        <strong>{incidencias.length}</strong>
                        <span>Total de casos</span>
                      </div>
                    </div>
                    <div className="history-summary-card">
                      <span className="summary-marker summary-marker-amber" />
                      <div>
                        <strong>
                          {incidencias.filter((i) => normalizar(i.estado).includes('pendiente')).length}
                        </strong>
                        <span>Pendientes</span>
                      </div>
                    </div>
                    <div className="history-summary-card">
                      <span className="summary-marker summary-marker-green" />
                      <div>
                        <strong>
                          {incidencias.filter((i) => {
                            const estado = normalizar(i.estado)
                            return estado.includes('atendid') ||
                              estado.includes('resuelt') ||
                              estado.includes('cerrad')
                          }).length}
                        </strong>
                        <span>Atendidas</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="history-filter-panel">
                  <label className="ciudadanos-search history-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={busquedaHistorial}
                      onChange={(event) => setBusquedaHistorial(event.target.value)}
                      placeholder="Buscar por código, título, categoría o dirección…"
                      aria-label="Buscar en el historial"
                    />
                  </label>

                  <div className="history-selects">
                    <label className="ciudadanos-filter">
                      <span>Estado</span>
                      <select
                        value={filtroEstado}
                        onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="atendida">Atendidas</option>
                        <option value="rechazada">Rechazadas</option>
                      </select>
                    </label>
                    <label className="ciudadanos-filter">
                      <span>Prioridad</span>
                      <select
                        value={filtroPrioridad}
                        onChange={(event) => setFiltroPrioridad(event.target.value as FiltroPrioridad)}
                      >
                        <option value="todas">Todas las prioridades</option>
                        <option value="critica">Crítica</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </label>
                  </div>
                </div>

                {cargandoHistorial ? (
                  <div className="history-state">
                    <span className="ciudadanos-loader" />
                    <strong>Cargando historial</strong>
                    <p>Estamos consultando las incidencias del ciudadano.</p>
                  </div>
                ) : errorHistorial ? (
                  <div className="history-state history-state-error" role="alert">
                    <span className="history-state-icon" aria-hidden="true">!</span>
                    <strong>No se pudo cargar el historial</strong>
                    <p>{errorHistorial}</p>
                    <button
                      type="button"
                      className="ciudadanos-btn ciudadanos-btn-secondary"
                      onClick={() => void abrirHistorial(seleccionado)}
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                ) : incidenciasFiltradas.length === 0 ? (
                  <div className="history-state">
                    <span className="history-empty-icon" aria-hidden="true">▤</span>
                    <strong>
                      {incidencias.length === 0
                        ? 'Este ciudadano no tiene incidencias registradas'
                        : 'No hay incidencias que coincidan'}
                    </strong>
                    <p>
                      {incidencias.length === 0
                        ? 'Cuando reporte una incidencia, aparecerá en esta sección.'
                        : 'Prueba con otros términos o modifica los filtros.'}
                    </p>
                    {incidencias.length > 0 && (
                      <button
                        type="button"
                        className="ciudadanos-btn ciudadanos-btn-secondary"
                        onClick={() => {
                          setBusquedaHistorial('')
                          setFiltroEstado('todos')
                          setFiltroPrioridad('todas')
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="history-results-heading">
                    <h3>Incidencias reportadas</h3>
                    <span>{incidenciasFiltradas.length} casos encontrados</span>
                  </div>
                )}

                {!cargandoHistorial && !errorHistorial && incidenciasFiltradas.length > 0 && (
                  <div className="history-layout">
                    <div className="history-list">
                      {incidenciasFiltradas.map((incidencia) => (
                        <button
                          key={incidencia.id_incidencia}
                          type="button"
                          className={`history-card ${
                            incidenciaActiva?.id_incidencia === incidencia.id_incidencia
                              ? 'history-card-active'
                              : ''
                          }`}
                          onClick={() =>
                            setIncidenciaActiva((actual) =>
                              actual?.id_incidencia === incidencia.id_incidencia
                                ? null
                                : incidencia,
                            )
                          }
                          aria-expanded={
                            incidenciaActiva?.id_incidencia === incidencia.id_incidencia
                          }
                        >
                          <div className="history-card-top">
                            <span className="history-code">
                              {incidencia.codigo_incidencia || `INC-${incidencia.id_incidencia}`}
                            </span>
                            <span className={`ciudadanos-badge ${claseEstado(incidencia.estado)}`}>
                              <span className="badge-dot" />
                              {textoEstado(incidencia.estado)}
                            </span>
                          </div>

                          <h4>{incidencia.titulo || 'Incidencia sin título'}</h4>

                          <p className="history-card-description">
                            {incidencia.descripcion || 'Sin descripción registrada.'}
                          </p>

                          <div className="history-card-meta">
                            <span>▦ {incidencia.categoria || 'Sin categoría'}</span>
                            <span>◷ {fechaLegible(incidencia.fecha_reporte)}</span>
                          </div>

                          <div className="history-card-bottom">
                            <span className={`priority-pill ${clasePrioridad(incidencia.prioridad)}`}>
                              <span className="priority-dot" />
                              {textoPrioridad(incidencia.prioridad)}
                            </span>
                            <span className="history-card-action">
                              {incidenciaActiva?.id_incidencia === incidencia.id_incidencia
                                ? 'Ocultar detalle ↑'
                                : 'Ver detalle ↓'}
                            </span>
                          </div>

                          {incidenciaActiva?.id_incidencia === incidencia.id_incidencia && (
                            <div className="history-card-expanded">
                              <span className="expanded-label">Descripción completa</span>
                              <p>{incidencia.descripcion || 'Sin descripción registrada.'}</p>
                              <span className="expanded-label">Dirección del incidente</span>
                              <p>{incidencia.direccion_texto || 'Sin dirección registrada.'}</p>
                              <span className="expanded-label">Identificador</span>
                              <p>#{incidencia.id_incidencia}</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions history-modal-actions">
                  <button
                    type="button"
                    className="ciudadanos-btn ciudadanos-btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cerrar historial
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="ciudadanos-detail-item">
      <span>{label}</span>
      <strong>{value?.trim() || 'No registrado'}</strong>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="ciudadanos-field">
      <span>
        {label}
        {required && <span className="field-required"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
