import type { Incidencia } from '../types/incidencias.types';

interface Props {
  incidencias: Incidencia[];
  loading: boolean;
  onVerDetalle: (incidencia: Incidencia) => void;
  onValidar: (incidencia: Incidencia) => void;
  onObservar: (incidencia: Incidencia) => void;
  onRechazar: (incidencia: Incidencia) => void;
  accionEnCursoId: number | null;
}

const nombreCiudadano = (incidencia: Incidencia) => {
  const nombre = [
    incidencia.ciudadano_nombres,
    incidencia.apellido_paterno,
    incidencia.apellido_materno,
  ]
    .filter((parte) => parte?.trim())
    .join(' ')
    .trim();

  return nombre || 'No disponible';
};

const normalizar = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return '—';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function IncidenciasTable({
  incidencias,
  loading,
  onVerDetalle,
  onValidar,
  onObservar,
  onRechazar,
  accionEnCursoId,
}: Props) {
  if (loading) {
    return (
      <div className="inc-table-message" role="status">
        <span className="inc-loader" />
        Cargando incidencias...
      </div>
    );
  }

  if (incidencias.length === 0) {
    return (
      <div className="inc-table-message">
        <span className="inc-empty-icon" aria-hidden="true">
          ◌
        </span>

        <strong>No se encontraron incidencias</strong>

        <span>
          Prueba cambiando los filtros de búsqueda.
        </span>
      </div>
    );
  }

  return (
    <div className="inc-table-wrapper">
      <table className="inc-table">
        <thead>
          <tr>
            <th scope="col">Código / fecha</th>
            <th scope="col">Incidencia</th>
            <th scope="col">Ciudadano</th>
            <th scope="col">Categoría</th>
            <th scope="col">Sector</th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className="inc-sr-only">
                Acciones
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {incidencias.map((incidencia) => {
            const estado =
              incidencia.estado?.trim() || 'Sin estado';

            const esPendiente =
              estado.toLocaleLowerCase('es-PE') === 'pendiente';

            const accionEnCurso =
              accionEnCursoId === incidencia.id_incidencia;

            return (
              <tr key={incidencia.id_incidencia}>
                <td>
                  <div className="inc-code">
                    {incidencia.codigo_incidencia || 'Sin código'}
                  </div>

                  <div className="inc-muted">
                    {formatearFecha(incidencia.fecha_reporte)}
                  </div>
                </td>

                <td>
                  <div className="inc-title-cell">
                    {incidencia.titulo || 'Sin título'}
                  </div>

                  <div className="inc-muted inc-description-cell">
                    {incidencia.direccion_texto ||
                      'Sin dirección registrada'}
                  </div>
                </td>

                <td>{nombreCiudadano(incidencia)}</td>

                <td>
                  {incidencia.categoria || 'Sin categoría'}
                </td>

                <td>
                  {incidencia.sector || 'Sin sector'}
                </td>

                <td>
                  <span
                    className={`inc-status inc-status-${normalizar(estado)}`}
                  >
                    <span className="inc-status-dot" />
                    {estado}
                  </span>
                </td>

                <td>
                  <div className="inc-row-actions">
                    <button
                      type="button"
                      className="inc-button inc-button-details"
                      onClick={() => onVerDetalle(incidencia)}
                    >
                      Ver detalle
                    </button>

                    {esPendiente && (
                      <>
                        <button
                          type="button"
                          className="inc-button inc-button-validate"
                          disabled={accionEnCurso}
                          onClick={() => onValidar(incidencia)}
                        >
                          {accionEnCurso ? 'Procesando...' : 'Validar'}
                        </button>

                        <button
                          type="button"
                          className="inc-button inc-button-observe"
                          disabled={accionEnCurso}
                          onClick={() => onObservar(incidencia)}
                        >
                          Observar
                        </button>

                        <button
                          type="button"
                          className="inc-button inc-button-reject"
                          disabled={accionEnCurso}
                          onClick={() => onRechazar(incidencia)}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}