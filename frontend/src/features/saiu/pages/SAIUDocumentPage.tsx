
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSAIUPdf } from '../api/saiu.api'
import '../saiu.css'

export default function SAIUDocumentPage() {
  const { id_saiu } = useParams<{ id_saiu: string }>()
  const navigate = useNavigate()

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    let urlTemporal: string | null = null

    const id = Number(id_saiu)

    if (!Number.isInteger(id) || id <= 0) {
      setError('El identificador de la solicitud no es válido.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    getSAIUPdf(id)
      .then((pdf) => {
        if (pdf.type && pdf.type !== 'application/pdf') {
          throw new Error('El servidor no devolvió un documento PDF válido.')
        }

        urlTemporal = URL.createObjectURL(pdf)

        if (!cancelado) setPdfUrl(urlTemporal)
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setError(
            e instanceof Error
              ? e.message
              : 'No se pudo cargar el documento.'
          )
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
      if (urlTemporal) URL.revokeObjectURL(urlTemporal)
    }
  }, [id_saiu])

  return (
    <main className="saiu-document-page">
      <header className="saiu-document-toolbar">
        <button
          type="button"
          className="saiu-toolbar-back"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Volver
        </button>

        <div className="saiu-toolbar-title">
          <span className="saiu-toolbar-icon">
            <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
          </span>
          <div>
            <strong>Solicitud administrativa SAIU</strong>
            <span>Solicitud #{id_saiu}</span>
          </div>
        </div>

        <div className="saiu-toolbar-actions">
          {pdfUrl && (
            <>
              <button
                type="button"
                className="saiu-toolbar-button"
                onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
              >
                <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                Abrir PDF
              </button>

              <a
                className="saiu-toolbar-button"
                href={pdfUrl}
                download={`SAIU-${id_saiu}.pdf`}
              >
                <i className="bi bi-download" aria-hidden="true" />
                Descargar
              </a>
            </>
          )}
        </div>
      </header>

      <section className="saiu-document-content">
        {loading ? (
          <div className="saiu-document-state">
            <span className="saiu-spinner" />
            <h2>Cargando documento</h2>
            <p>Obteniendo la versión actual del PDF desde el servidor.</p>
          </div>
        ) : error ? (
          <div className="saiu-document-state saiu-document-error">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            <h2>No se pudo mostrar el documento</h2>
            <p>{error}</p>
            <button
              type="button"
              className="saiu-button"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`Solicitud administrativa SAIU ${id_saiu}`}
            className="saiu-document-frame"
          />
        ) : null}
      </section>
    </main>
  )
}
