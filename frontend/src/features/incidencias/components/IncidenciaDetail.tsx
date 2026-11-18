
import { useEffect } from 'react';

import type { Incidencia } from '../types/incidencias.types';

interface Props {
  incidencia: Incidencia;
  onClose: () => void;
  onValidar: (incidencia: Incidencia) => void;
  onObservar: (incidencia: Incidencia) => void;
  onRechazar: (incidencia: Incidencia) => void;
  accionEnCurso: boolean;
  onEditar?: (incidencia: Incidencia) => void;
  puedeEditar?: boolean;
}

const nombreCiudadano = (incidencia: Incidencia) =>
  [
    incidencia.ciudadano_nombres,
    incidencia.apellido_paterno,
    incidencia.apellido_materno,
  ]
    .filter((parte) => parte?.trim())
    .join(' ')
    .trim() || 'No disponible';

const mostrarValor = (
  valor?: string | number | null
): string => {
  if (valor === undefined || valor === null || valor === '') {
    return 'No disponible';
  }

  return String(valor);
};

const normalizarEstado = (estado?: string | null) =>
  estado
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim() ?? '';

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return 'No disponible';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

export default function IncidenciaDetail({
  incidencia,
  onClose,
  onValidar,
  onObservar,
  onRechazar,
  accionEnCurso,
  onEditar,
  puedeEditar = false,
}: Props) {
  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', cerrarConEscape);

    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [onClose]);

  const tieneCoordenadas =
    incidencia.latitud != null &&
    incidencia.longitud != null;

  const ubicacionUrl = tieneCoordenadas
    ? `https://www.openstreetmap.org/?mlat=${incidencia.latitud}&mlon=${incidencia.longitud}#map=18/${incidencia.latitud}/${incidencia.longitud}`
    : null;

  const estado = normalizarEstado(incidencia.estado);

  const estaPendiente = estado === 'pendiente';
  const estaObservada = estado === 'observada';

  const puedeGestionar = estaPendiente;
  const puedeEditarIncidencia =
    puedeEditar &&
    (estaPendiente || estaObservada) &&
    Boolean(onEditar);

  return (
    <div
      className="inc-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !accionEnCurso) {
          onClose();
        }
      }}
    >
      <section
        className="inc-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inc-detail-title"
      >
        <header className="inc-detail-header">
          <div>
            <span className="inc-detail-eyebrow">
              DETALLE DE INCIDENCIA
            </span>

            <h2 id="inc-detail-title">
              {incidencia.codigo_incidencia}
            </h2>

            <p>
              Registrada el {formatearFecha(incidencia.fecha_reporte)}
            </p>
          </div>

          <button
            type="button"
            className="inc-close-button"
            onClick={onClose}
            disabled={accionEnCurso}
            aria-label="Cerrar detalle"
          >
            ×
          </button>
        </header>

        <div className="inc-detail-content">
          <section className="inc-detail-section">
            <h3>Información de la incidencia</h3>

            <div className="inc-detail-grid">
              <div className="inc-detail-item inc-detail-full">
                <span>Título</span>
                <strong>
                  {mostrarValor(incidencia.titulo)}
                </strong>
              </div>

              <div className="inc-detail-item inc-detail-full">
                <span>Descripción</span>
                <p>
                  {mostrarValor(incidencia.descripcion)}
                </p>
              </div>

              <div className="inc-detail-item">
                <span>Categoría</span>
                <strong>
                  {mostrarValor(incidencia.categoria)}
                </strong>
              </div>

              <div className="inc-detail-item">
                <span>Estado</span>
                <strong>
                  {mostrarValor(incidencia.estado)}
                </strong>
              </div>

              <div className="inc-detail-item">
                <span>Sector</span>
                <strong>
                  {mostrarValor(incidencia.sector)}
                </strong>
              </div>

              <div className="inc-detail-item">
                <span>Prioridad</span>
                <strong>
                  {mostrarValor(incidencia.prioridad)}
                </strong>
              </div>
            </div>
          </section>

          <section className="inc-detail-section">
            <h3>Datos del ciudadano</h3>

            <div className="inc-detail-grid">
              <div className="inc-detail-item">
                <span>Nombre completo</span>
                <strong>{nombreCiudadano(incidencia)}</strong>
              </div>

              <div className="inc-detail-item">
                <span>ID del ciudadano</span>
                <strong>
                  {mostrarValor(incidencia.id_ciudadano)}
                </strong>
              </div>
            </div>
          </section>

          <section className="inc-detail-section">
            <h3>Ubicación</h3>

            <div className="inc-detail-grid">
              <div className="inc-detail-item inc-detail-full">
                <span>Dirección</span>
                <strong>
                  {mostrarValor(incidencia.direccion_texto)}
                </strong>
              </div>

              <div className="inc-detail-item inc-detail-full">
                <span>Referencia</span>
                <p>
                  {mostrarValor(incidencia.referencia)}
                </p>
              </div>

              <div className="inc-detail-item">
                <span>Latitud</span>
                <strong>
                  {incidencia.latitud != null
                    ? incidencia.latitud.toFixed(6)
                    : 'No disponible'}
                </strong>
              </div>

              <div className="inc-detail-item">
                <span>Longitud</span>
                <strong>
                  {incidencia.longitud != null
                    ? incidencia.longitud.toFixed(6)
                    : 'No disponible'}
                </strong>
              </div>
            </div>

            {ubicacionUrl && (
              <a
                className="inc-map-link"
                href={ubicacionUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ver ubicación en OpenStreetMap ↗
              </a>
            )}
          </section>
        </div>

        <footer className="inc-detail-footer">
          {puedeEditarIncidencia && (
            <button
              type="button"
              className="inc-button inc-button-secondary"
              onClick={() => onEditar?.(incidencia)}
              disabled={accionEnCurso}
            >
              Editar
            </button>
          )}

          {puedeGestionar && (
            <>
              <button
                type="button"
                className="inc-button inc-button-secondary"
                onClick={() => onObservar(incidencia)}
                disabled={accionEnCurso}
              >
                Observar
              </button>

              <button
                type="button"
                className="inc-button inc-button-secondary"
                onClick={() => onRechazar(incidencia)}
                disabled={accionEnCurso}
              >
                Rechazar
              </button>

              <button
                type="button"
                className="inc-button inc-button-primary"
                onClick={() => onValidar(incidencia)}
                disabled={accionEnCurso}
              >
                {accionEnCurso ? 'Procesando...' : 'Validar'}
              </button>
            </>
          )}

          <button
            type="button"
            className="inc-button inc-button-secondary"
            onClick={onClose}
            disabled={accionEnCurso}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
