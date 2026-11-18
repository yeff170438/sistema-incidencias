
import { useEffect, useMemo, useState } from 'react'
import { getSAIUPdf } from '../api/saiu.api'
import { useSAIU } from '../hooks/useSAIU'
import type { SAIU } from '../types/saiu.types'
import '../saiu.css'

export default function SAIUPage() {
  const {
    solicitudes,
    loading,
    error,
    loadAllSAIU,
  } = useSAIU()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [errorPdf, setErrorPdf] = useState<string | null>(null)

  useEffect(() => {
    void loadAllSAIU().catch(() => undefined)
  }, [loadAllSAIU])

  const estadoDe = (s: SAIU) =>
    s.estado_saiu || s.estado || 'Sin estado'

  const codigoDe = (s: SAIU) =>
    s.codigo_saiu || `SAIU-${s.id_saiu}`

  const solicitudesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return solicitudes.filter((s) => {
      const coincideTexto = [
        s.codigo_saiu,
        s.id_saiu,
        s.id_ticket,
        s.numero_expediente,
        s.expediente,
        s.oficina,
        s.usuario,
        estadoDe(s),
      ].some((valor) =>
        String(valor ?? '').toLowerCase().includes(termino)
      )

      const coincideEstado =
        filtroEstado === 'TODOS' ||
        estadoDe(s).toLowerCase() === filtroEstado.toLowerCase()

      return coincideTexto && coincideEstado
    })
  }, [solicitudes, busqueda, filtroEstado])

  const estados = useMemo(
    () => [...new Set(solicitudes.map(estadoDe))].sort(),
    [solicitudes]
  )

  const solicitudSeleccionada = solicitudes.find(
    (s) => s.id_saiu === seleccionado
  )

  useEffect(() => {
    if (!seleccionado) {
      setPdfUrl(null)
      setErrorPdf(null)
      setLoadingPreview(false)
      return
    }

    let cancelado = false
    let urlTemporal: string | null = null

    setLoadingPreview(true)
    setErrorPdf(null)
    setPdfUrl(null)

    getSAIUPdf(seleccionado)
      .then((pdf) => {
        if (pdf.type && pdf.type !== 'application/pdf') {
          throw new Error('El servidor no devolvió un PDF válido.')
        }

        urlTemporal = URL.createObjectURL(pdf)

        if (!cancelado) {
          setPdfUrl(urlTemporal)
        }
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setErrorPdf(
            e instanceof Error
              ? e.message
              : 'No se pudo cargar la vista previa del PDF.'
          )
        }
      })
      .finally(() => {
        if (!cancelado) {
          setLoadingPreview(false)
        }
      })

    return () => {
      cancelado = true

      if (urlTemporal) {
        URL.revokeObjectURL(urlTemporal)
      }
    }
  }, [seleccionado])



  return (
    <main className="saiu-page">
      <header className="saiu-page-header">
        <div>
          <span className="saiu-eyebrow">
            GESTIÓN DOCUMENTAL
          </span>

          <h1>Solicitudes administrativas</h1>

          <p>
            Consulta las solicitudes y visualiza sus documentos
            directamente en esta pantalla.
          </p>
        </div>

        <button
          type="button"
          className="saiu-button"
          disabled={loading}
          onClick={() => void loadAllSAIU().catch(() => undefined)}
        >
          <i
            className="bi bi-arrow-clockwise"
            aria-hidden="true"
          />
          {loading ? 'Actualizando...' : 'Actualizar listado'}
        </button>
      </header>

      <section className="saiu-summary">
        <div className="saiu-summary-icon">
          <i
            className="bi bi-file-earmark-text"
            aria-hidden="true"
          />
        </div>

        <div>
          <span>Solicitudes registradas</span>
          <strong>{solicitudes.length}</strong>
        </div>

        <div className="saiu-summary-divider" />

        <div>
          <span>Resultados actuales</span>
          <strong>{solicitudesFiltradas.length}</strong>
        </div>
      </section>

      {error && (
        <div className="saiu-alert" role="alert">
          <i
            className="bi bi-exclamation-triangle"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <section className="saiu-workspace">
        <aside className="saiu-list-panel">
          <div className="saiu-list-heading">
            <div>
              <h2>Listado de solicitudes</h2>
              <p>Selecciona una solicitud para revisar su PDF.</p>
            </div>
          </div>

          <label className="saiu-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar solicitud..."
              aria-label="Buscar solicitudes"
            />
          </label>

          <label
            className="saiu-filter-label"
            htmlFor="saiu-filtro-estado"
          >
            Filtrar por estado
          </label>

          <select
            id="saiu-filtro-estado"
            className="saiu-filter"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>

            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <p className="saiu-results-count">
            {solicitudesFiltradas.length}{' '}
            {solicitudesFiltradas.length === 1
              ? 'solicitud encontrada'
              : 'solicitudes encontradas'}
          </p>

          <div className="saiu-request-list">
            {loading && solicitudes.length === 0 ? (
              <div className="saiu-list-message">
                <span className="saiu-spinner" />
                <p>Cargando solicitudes...</p>
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="saiu-list-message">
                <i
                  className="bi bi-inbox"
                  aria-hidden="true"
                />
                <p>No se encontraron solicitudes.</p>
              </div>
            ) : (
              solicitudesFiltradas.map((s) => (
                <button
                  key={s.id_saiu}
                  type="button"
                  className={`saiu-request-item ${
                    seleccionado === s.id_saiu
                      ? 'is-selected'
                      : ''
                  }`}
                  aria-pressed={seleccionado === s.id_saiu}
                  onClick={() => setSeleccionado(s.id_saiu)}
                >
                  <span className="saiu-request-icon">
                    <i
                      className="bi bi-file-earmark-pdf"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="saiu-request-content">
                    <strong>{codigoDe(s)}</strong>

                    <span>
                      Ticket #{s.id_ticket ?? 'Sin ticket'}
                    </span>

                    <span className="saiu-status">
                      {estadoDe(s)}
                    </span>

                    {s.oficina && (
                      <small>{s.oficina}</small>
                    )}
                  </span>

                  <i
                    className="bi bi-chevron-right saiu-chevron"
                    aria-hidden="true"
                  />
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="saiu-preview-panel">
          {!solicitudSeleccionada ? (
            <div className="saiu-preview-empty">
              <div className="saiu-preview-empty-icon">
                <i
                  className="bi bi-file-earmark-pdf"
                  aria-hidden="true"
                />
              </div>

              <h2>Vista previa del documento</h2>

              <p>
                Selecciona una solicitud de la lista para
                visualizar su documento PDF aquí.
              </p>
            </div>
          ) : (
            <>
              <header className="saiu-preview-header">
                <div>
                  <span className="saiu-eyebrow">
                    DOCUMENTO SELECCIONADO
                  </span>

                  <h2>{codigoDe(solicitudSeleccionada)}</h2>

                  <p>
                    Ticket #{solicitudSeleccionada.id_ticket ?? 'Sin ticket'}
                    {' · '}
                    {estadoDe(solicitudSeleccionada)}
                  </p>
                </div>
              </header>

              <div className="saiu-document-meta">
                <div>
                  <span>Solicitud SAIU</span>
                  <strong>
                    {solicitudSeleccionada.id_saiu}
                  </strong>
                </div>

                <div>
                  <span>Oficina responsable</span>
                  <strong>
                    {solicitudSeleccionada.oficina || 'No asignada'}
                  </strong>
                </div>

                <div>
                  <span>Expediente</span>
                  <strong>
                    {solicitudSeleccionada.numero_expediente ||
                      solicitudSeleccionada.expediente ||
                      'Sin expediente registrado'}
                  </strong>
                </div>
              </div>

              {errorPdf && (
                <div className="saiu-alert" role="alert">
                  <i
                    className="bi bi-exclamation-triangle"
                    aria-hidden="true"
                  />
                  <span>{errorPdf}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setSeleccionado((actual) => {
                        if (actual === null) return null
                        return actual
                      })
                    }
                    aria-label="Cerrar mensaje"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="saiu-pdf-viewer">
                {loadingPreview ? (
                  <div className="saiu-pdf-loading">
                    <span className="saiu-spinner" />
                    <strong>Cargando documento PDF</strong>
                    <p>
                      Estamos obteniendo el documento desde el
                      servidor.
                    </p>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    key={pdfUrl}
                    src={pdfUrl}
                    title={`Documento ${codigoDe(solicitudSeleccionada)}`}
                    className="saiu-pdf-iframe"
                  />
                ) : !errorPdf ? (
                  <div className="saiu-pdf-loading">
                    <p>No hay un documento disponible para mostrar.</p>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}
