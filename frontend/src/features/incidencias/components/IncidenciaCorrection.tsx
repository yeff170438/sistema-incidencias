import { useState, type FormEvent } from 'react';

import type {
  CorreccionIncidenciaData,
  Incidencia,
} from '../types/incidencias.types';

interface Props {
  incidencia: Incidencia;
  onCancel: () => void;
  onSubmit: (datos: CorreccionIncidenciaData) => Promise<void>;
}

export default function IncidenciaCorrection({
  incidencia,
  onCancel,
  onSubmit,
}: Props) {
  const [idCategoria, setIdCategoria] = useState(
    incidencia.id_categoria?.toString() ?? ''
  );

  const [idSector, setIdSector] = useState(
    incidencia.id_sector?.toString() ?? ''
  );

  const [titulo, setTitulo] = useState(incidencia.titulo);
  const [descripcion, setDescripcion] = useState(
    incidencia.descripcion
  );

  const [direccion, setDireccion] = useState(
    incidencia.direccion_texto ?? ''
  );

  const [referencia, setReferencia] = useState(
    incidencia.referencia ?? ''
  );

  const [latitud, setLatitud] = useState(
    incidencia.latitud?.toString() ?? ''
  );

  const [longitud, setLongitud] = useState(
    incidencia.longitud?.toString() ?? ''
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const categoria = Number(idCategoria);

    if (!Number.isInteger(categoria) || categoria <= 0) {
      setError('Ingresa un ID de categoría válido.');
      return;
    }

    const sector = idSector.trim()
      ? Number(idSector)
      : null;

    if (
      sector !== null &&
      (!Number.isInteger(sector) || sector <= 0)
    ) {
      setError('Ingresa un ID de sector válido o déjalo vacío.');
      return;
    }

    const lat = latitud.trim() ? Number(latitud) : null;
    const lon = longitud.trim() ? Number(longitud) : null;

    if (
      (lat !== null &&
        (!Number.isFinite(lat) || lat < -90 || lat > 90)) ||
      (lon !== null &&
        (!Number.isFinite(lon) || lon < -180 || lon > 180))
    ) {
      setError('Las coordenadas geográficas no son válidas.');
      return;
    }

    if ((lat === null) !== (lon === null)) {
      setError(
        'Debes proporcionar tanto latitud como longitud, o dejar ambas vacías.'
      );
      return;
    }

    if (!titulo.trim() || !descripcion.trim()) {
      setError('El título y la descripción son obligatorios.');
      return;
    }

    setGuardando(true);

    try {
      await onSubmit({
        id_categoria: categoria,
        id_sector: sector,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        direccion_texto: direccion.trim(),
        referencia: referencia.trim(),
        longitud: lon,
        latitud: lat,
      });
    } catch (err: unknown) {
      const errorApi = err as { message?: string };

      setError(
        errorApi.message ??
          'No se pudo completar la corrección.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="inc-modal-backdrop">
      <section
        className="inc-detail-modal inc-correction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inc-correction-title"
      >
        <header className="inc-detail-header">
          <div>
            <span className="inc-detail-eyebrow">
              CORRECCIÓN ADMINISTRATIVA
            </span>

            <h2 id="inc-correction-title">
              {incidencia.codigo_incidencia}
            </h2>

            <p>Revisión de datos de la incidencia.</p>
          </div>

          <button
            type="button"
            className="inc-close-button"
            onClick={onCancel}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </header>

        <form onSubmit={enviar}>
          <div className="inc-detail-content">
            <div className="inc-correction-grid">
              <div className="inc-form-field">
                <label htmlFor="correccion-titulo">
                  Título *
                </label>

                <input
                  id="correccion-titulo"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  required
                  maxLength={200}
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-categoria">
                  ID de categoría *
                </label>

                <input
                  id="correccion-categoria"
                  type="number"
                  min="1"
                  step="1"
                  value={idCategoria}
                  onChange={(event) =>
                    setIdCategoria(event.target.value)
                  }
                  required
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-descripcion">
                  Descripción *
                </label>

                <textarea
                  id="correccion-descripcion"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  required
                  rows={4}
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-sector">
                  ID de sector
                </label>

                <input
                  id="correccion-sector"
                  type="number"
                  min="1"
                  step="1"
                  value={idSector}
                  onChange={(event) =>
                    setIdSector(event.target.value)
                  }
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-direccion">
                  Dirección
                </label>

                <input
                  id="correccion-direccion"
                  value={direccion}
                  onChange={(event) =>
                    setDireccion(event.target.value)
                  }
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-referencia">
                  Referencia
                </label>

                <input
                  id="correccion-referencia"
                  value={referencia}
                  onChange={(event) =>
                    setReferencia(event.target.value)
                  }
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-latitud">
                  Latitud
                </label>

                <input
                  id="correccion-latitud"
                  type="number"
                  step="any"
                  value={latitud}
                  onChange={(event) =>
                    setLatitud(event.target.value)
                  }
                />
              </div>

              <div className="inc-form-field">
                <label htmlFor="correccion-longitud">
                  Longitud
                </label>

                <input
                  id="correccion-longitud"
                  type="number"
                  step="any"
                  value={longitud}
                  onChange={(event) =>
                    setLongitud(event.target.value)
                  }
                />
              </div>
            </div>

            {error && (
              <div className="inc-action-error" role="alert">
                {error}
              </div>
            )}

            <p className="inc-correction-notice">
              Este formulario requiere un endpoint de corrección
              administrativa con permisos y auditoría antes de poder
              guardar cambios.
            </p>
          </div>

          <footer className="inc-detail-footer">
            <button
              type="button"
              className="inc-button inc-button-secondary"
              onClick={onCancel}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inc-button inc-button-validate"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Continuar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}