
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { useAuth } from '../../../context/AuthContext';

import IncidenciasFilters from '../components/IncidenciasFilters';
import IncidenciasTable from '../components/IncidenciasTable';
import IncidenciaDetail from '../components/IncidenciaDetail';
import IncidenciaCorrection from '../components/IncidenciaCorrection';

import { useIncidencias } from '../hooks/useIncidencias';

import {
  validarIncidencia,
  observarIncidencia,
  rechazarIncidencia,
  editarIncidencia,
} from '../services/incidencias.service';

import type {
  Incidencia,
  IncidenciasFilters as Filtros,
  CorreccionIncidenciaData,
} from '../types/incidencias.types';

import '../styles/incidencias.css';

const filtrosIniciales: Filtros = {
  busqueda: '',
  estado: '',
  categoria: '',
};

interface ErrorApi {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const normalizar = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const nombreCiudadano = (incidencia: Incidencia) =>
  [
    incidencia.ciudadano_nombres,
    incidencia.apellido_paterno,
    incidencia.apellido_materno,
  ]
    .filter((parte) => parte?.trim())
    .join(' ');

const obtenerMensajeError = (error: unknown) => {
  const errorApi = error as ErrorApi;

  return (
    errorApi.response?.data?.message ??
    errorApi.message ??
    'Ocurrió un error al ejecutar la operación.'
  );
};

export default function IncidenciasPage() {
  const {
    incidencias,
    loading,
    error,
    recargar,
  } = useIncidencias();

  const { usuario } = useAuth();

  const puedeEditarIncidencias =
    usuario?.rol?.toUpperCase() === 'ADMIN';

  const [filtros, setFiltros] =
    useState<Filtros>(filtrosIniciales);

  const [incidenciaSeleccionada, setIncidenciaSeleccionada] =
    useState<Incidencia | null>(null);

  const [incidenciaParaEditar, setIncidenciaParaEditar] =
    useState<Incidencia | null>(null);

  const [incidenciaParaObservar, setIncidenciaParaObservar] =
    useState<Incidencia | null>(null);

  const [idMotivo, setIdMotivo] = useState('');
  const [comentario, setComentario] = useState('');

  const [accionEnCursoId, setAccionEnCursoId] =
    useState<number | null>(null);

  const [mensajeAccion, setMensajeAccion] =
    useState<string | null>(null);

  const [errorAccion, setErrorAccion] =
    useState<string | null>(null);

  // Mantiene el detalle sincronizado con los datos recargados.
  useEffect(() => {
    if (!incidenciaSeleccionada) return;

    const incidenciaActualizada = incidencias.find(
      (incidencia) =>
        incidencia.id_incidencia ===
        incidenciaSeleccionada.id_incidencia
    );

    if (
      incidenciaActualizada &&
      incidenciaActualizada !== incidenciaSeleccionada
    ) {
      setIncidenciaSeleccionada(incidenciaActualizada);
    }
  }, [incidencias, incidenciaSeleccionada]);

  // Mantiene los datos de edición sincronizados cuando se recarga
  // la lista, siempre que no se esté guardando una modificación.
  useEffect(() => {
    if (!incidenciaParaEditar || accionEnCursoId !== null) return;

    const incidenciaActualizada = incidencias.find(
      (incidencia) =>
        incidencia.id_incidencia ===
        incidenciaParaEditar.id_incidencia
    );

    if (
      incidenciaActualizada &&
      incidenciaActualizada !== incidenciaParaEditar
    ) {
      setIncidenciaParaEditar(incidenciaActualizada);
    }
  }, [incidencias, incidenciaParaEditar, accionEnCursoId]);

  const estados = useMemo(
    () =>
      [
        ...new Set(
          incidencias
            .map((incidencia) => incidencia.estado?.trim())
            .filter((estado): estado is string => Boolean(estado))
        ),
      ].sort((a, b) => a.localeCompare(b, 'es')),
    [incidencias]
  );

  const categorias = useMemo(
    () =>
      [
        ...new Set(
          incidencias
            .map((incidencia) => incidencia.categoria?.trim())
            .filter(
              (categoria): categoria is string =>
                Boolean(categoria)
            )
        ),
      ].sort((a, b) => a.localeCompare(b, 'es')),
    [incidencias]
  );

  const incidenciasFiltradas = useMemo(() => {
    const busqueda = normalizar(filtros.busqueda);

    return incidencias.filter((incidencia) => {
      const contenidoBusqueda = normalizar(
        [
          incidencia.codigo_incidencia,
          incidencia.titulo,
          incidencia.descripcion,
          incidencia.direccion_texto ?? '',
          incidencia.referencia ?? '',
          incidencia.categoria ?? '',
          incidencia.sector ?? '',
          nombreCiudadano(incidencia),
        ].join(' ')
      );

      const coincideBusqueda =
        !busqueda || contenidoBusqueda.includes(busqueda);

      const coincideEstado =
        !filtros.estado ||
        normalizar(incidencia.estado ?? '') ===
          normalizar(filtros.estado);

      const coincideCategoria =
        !filtros.categoria ||
        normalizar(incidencia.categoria ?? '') ===
          normalizar(filtros.categoria);

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideCategoria
      );
    });
  }, [incidencias, filtros]);

  const contarEstado = (estadoBuscado: string) =>
    incidencias.filter(
      (incidencia) =>
        normalizar(incidencia.estado ?? '') ===
        normalizar(estadoBuscado)
    ).length;

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
  };

  // =====================================
  // VALIDAR INCIDENCIA
  // =====================================

  const handleValidar = async (incidencia: Incidencia) => {
    const confirmar = window.confirm(
      `¿Confirmas la validación de ${incidencia.codigo_incidencia}?\n\n` +
        'El backend cambiará su estado y ejecutará el flujo de creación del ticket.'
    );

    if (!confirmar) return;

    setAccionEnCursoId(incidencia.id_incidencia);
    setMensajeAccion(null);
    setErrorAccion(null);

    try {
      await validarIncidencia(incidencia.id_incidencia);

      setMensajeAccion(
        `La incidencia ${incidencia.codigo_incidencia} fue validada correctamente.`
      );

      await recargar();
    } catch (error: unknown) {
      setErrorAccion(obtenerMensajeError(error));
    } finally {
      setAccionEnCursoId(null);
    }
  };

  // =====================================
  // OBSERVAR INCIDENCIA
  // =====================================

  const abrirObservacion = (incidencia: Incidencia) => {
    setIncidenciaParaObservar(incidencia);
    setIdMotivo('');
    setComentario('');
    setMensajeAccion(null);
    setErrorAccion(null);
  };

  const cerrarObservacion = () => {
    if (accionEnCursoId !== null) return;

    setIncidenciaParaObservar(null);
    setIdMotivo('');
    setComentario('');
  };

  const handleObservar = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!incidenciaParaObservar) return;

    const motivo = Number(idMotivo);

    if (!Number.isInteger(motivo) || motivo <= 0) {
      setErrorAccion('Ingresa un ID de motivo válido.');
      return;
    }

    if (!comentario.trim()) {
      setErrorAccion(
        'Es necesario registrar el comentario de la observación.'
      );
      return;
    }

    setAccionEnCursoId(
      incidenciaParaObservar.id_incidencia
    );
    setMensajeAccion(null);
    setErrorAccion(null);

    try {
      await observarIncidencia(
        incidenciaParaObservar.id_incidencia,
        {
          id_motivo: motivo,
          comentario: comentario.trim(),
        }
      );

      setMensajeAccion(
        `La incidencia ${incidenciaParaObservar.codigo_incidencia} fue observada correctamente.`
      );

      setIncidenciaParaObservar(null);
      setIdMotivo('');
      setComentario('');

      await recargar();
    } catch (error: unknown) {
      setErrorAccion(obtenerMensajeError(error));
    } finally {
      setAccionEnCursoId(null);
    }
  };

  // =====================================
  // RECHAZAR INCIDENCIA
  // =====================================

  const handleRechazar = async (incidencia: Incidencia) => {
    const confirmar = window.confirm(
      `¿Confirmas el rechazo de ${incidencia.codigo_incidencia}?\n\n` +
        'Esta acción cambiará el estado de la incidencia. Verifica los datos antes de continuar.'
    );

    if (!confirmar) return;

    setAccionEnCursoId(incidencia.id_incidencia);
    setMensajeAccion(null);
    setErrorAccion(null);

    try {
      await rechazarIncidencia(incidencia.id_incidencia);

      setMensajeAccion(
        `La incidencia ${incidencia.codigo_incidencia} fue rechazada correctamente.`
      );

      await recargar();
    } catch (error: unknown) {
      setErrorAccion(obtenerMensajeError(error));
    } finally {
      setAccionEnCursoId(null);
    }
  };

  // =====================================
  // EDITAR INCIDENCIA (ADMINISTRADOR)
  // =====================================

  const abrirEdicion = (incidencia: Incidencia) => {
    if (!puedeEditarIncidencias) {
      setErrorAccion(
        'No tienes autorización para editar incidencias.'
      );
      return;
    }

    setIncidenciaParaEditar(incidencia);
    setErrorAccion(null);
    setMensajeAccion(null);
  };

  const cerrarEdicion = () => {
    if (accionEnCursoId !== null) return;

    setIncidenciaParaEditar(null);
    setErrorAccion(null);
  };

  const handleEditar = async (
    datos: CorreccionIncidenciaData
  ): Promise<void> => {
    if (!incidenciaParaEditar) {
      throw new Error('No se ha seleccionado una incidencia.');
    }

    if (!puedeEditarIncidencias) {
      throw new Error(
        'No tienes autorización para editar incidencias.'
      );
    }

    const incidencia = incidenciaParaEditar;

    setAccionEnCursoId(incidencia.id_incidencia);
    setErrorAccion(null);
    setMensajeAccion(null);

    try {
      await editarIncidencia(
        incidencia.id_incidencia,
        datos
      );

      setIncidenciaParaEditar(null);

      setMensajeAccion(
        `La incidencia ${incidencia.codigo_incidencia} fue actualizada correctamente.`
      );

      await recargar();
    } catch (error: unknown) {
      setErrorAccion(obtenerMensajeError(error));

      // Permite que el formulario permanezca abierto y muestre
      // el error mediante su propio estado.
      throw error;
    } finally {
      setAccionEnCursoId(null);
    }
  };

  const filtrosActivos =
    Boolean(filtros.busqueda.trim()) ||
    Boolean(filtros.estado) ||
    Boolean(filtros.categoria);

  return (
    <main className="incidencias-page">
      <div className="inc-page-header">
        <div>
          <div className="inc-breadcrumb">
            Gestión <span>/</span> Incidencias
          </div>

          <h1>Gestión de incidencias</h1>

          <p>
            Consulta, revisa y gestiona las incidencias urbanas
            registradas en el distrito.
          </p>
        </div>

        <button
          type="button"
          className="inc-button inc-button-refresh"
          onClick={() => void recargar()}
          disabled={loading || accionEnCursoId !== null}
        >
          <span aria-hidden="true">↻</span>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <section
        className="inc-summary-grid"
        aria-label="Resumen de incidencias"
      >
        <article className="inc-summary-card inc-summary-total">
          <div className="inc-summary-top">
            <span className="inc-summary-label">
              Total de incidencias
            </span>
            <span className="inc-summary-icon" aria-hidden="true">
              ◫
            </span>
          </div>

          <strong className="inc-summary-value">
            {loading ? '—' : incidencias.length}
          </strong>

          <span className="inc-summary-caption">
            Registros consultados
          </span>
        </article>

        <article className="inc-summary-card">
          <div className="inc-summary-top">
            <span className="inc-summary-label">Pendientes</span>
            <span
              className="inc-summary-icon inc-icon-pending"
              aria-hidden="true"
            >
              ◷
            </span>
          </div>

          <strong className="inc-summary-value">
            {loading ? '—' : contarEstado('Pendiente')}
          </strong>

          <span className="inc-summary-caption">
            Esperan revisión
          </span>
        </article>

        <article className="inc-summary-card">
          <div className="inc-summary-top">
            <span className="inc-summary-label">Observadas</span>
            <span
              className="inc-summary-icon inc-icon-observed"
              aria-hidden="true"
            >
              !
            </span>
          </div>

          <strong className="inc-summary-value">
            {loading ? '—' : contarEstado('Observada')}
          </strong>

          <span className="inc-summary-caption">
            Requieren subsanación
          </span>
        </article>

        <article className="inc-summary-card">
          <div className="inc-summary-top">
            <span className="inc-summary-label">Validadas</span>
            <span
              className="inc-summary-icon inc-icon-validated"
              aria-hidden="true"
            >
              ✓
            </span>
          </div>

          <strong className="inc-summary-value">
            {loading ? '—' : contarEstado('Validada')}
          </strong>

          <span className="inc-summary-caption">
            Aceptadas para gestión
          </span>
        </article>

        <article className="inc-summary-card">
          <div className="inc-summary-top">
            <span className="inc-summary-label">Rechazadas</span>
            <span
              className="inc-summary-icon inc-icon-rejected"
              aria-hidden="true"
            >
              ×
            </span>
          </div>

          <strong className="inc-summary-value">
            {loading ? '—' : contarEstado('Rechazada')}
          </strong>

          <span className="inc-summary-caption">
            No admitidas
          </span>
        </article>
      </section>

      <section className="inc-management-panel">
        <div className="inc-panel-header">
          <div>
            <h2>Listado de incidencias</h2>

            <p>
              Abre el detalle o selecciona una acción para una incidencia
              pendiente.
            </p>
          </div>

          <span className="inc-results-count">
            {loading
              ? 'Cargando...'
              : `${incidenciasFiltradas.length} resultado${
                  incidenciasFiltradas.length === 1 ? '' : 's'
                }`}
          </span>
        </div>

        <IncidenciasFilters
          filtros={filtros}
          estados={estados}
          categorias={categorias}
          onChange={setFiltros}
          onLimpiar={limpiarFiltros}
        />

        {mensajeAccion && (
          <div className="inc-action-success" role="status">
            <span>{mensajeAccion}</span>

            <button
              type="button"
              onClick={() => setMensajeAccion(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        )}

        {errorAccion && !incidenciaParaEditar && (
          <div className="inc-action-error" role="alert">
            <span>{errorAccion}</span>

            <button
              type="button"
              onClick={() => setErrorAccion(null)}
              aria-label="Cerrar mensaje de error"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="inc-error" role="alert">
            <div>
              <strong>
                No se pudieron cargar las incidencias
              </strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              className="inc-button inc-button-secondary"
              onClick={() => void recargar()}
            >
              Reintentar
            </button>
          </div>
        )}

        <IncidenciasTable
          incidencias={incidenciasFiltradas}
          loading={loading && incidencias.length === 0}
          onVerDetalle={setIncidenciaSeleccionada}
          onValidar={handleValidar}
          onObservar={abrirObservacion}
          onRechazar={handleRechazar}
          accionEnCursoId={accionEnCursoId}
        />

        {!loading &&
          !error &&
          incidencias.length > 0 &&
          incidenciasFiltradas.length === 0 &&
          filtrosActivos && (
            <div className="inc-reset-note">
              Ningún registro coincide con los filtros seleccionados.

              <button
                type="button"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          )}

        <footer className="inc-panel-footer">
          <span>
            Total cargado: <strong>{incidencias.length}</strong>
          </span>

          <span>
            Mostrando: <strong>{incidenciasFiltradas.length}</strong>
          </span>
        </footer>
      </section>

      {/* FORMULARIO DE OBSERVACIÓN */}
      {incidenciaParaObservar && (
        <div
          className="inc-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarObservacion();
            }
          }}
        >
          <section
            className="inc-detail-modal inc-observation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inc-observation-title"
          >
            <header className="inc-detail-header">
              <div>
                <span className="inc-detail-eyebrow">
                  OBSERVACIÓN DE INCIDENCIA
                </span>

                <h2 id="inc-observation-title">
                  {incidenciaParaObservar.codigo_incidencia}
                </h2>

                <p>{incidenciaParaObservar.titulo}</p>
              </div>

              <button
                type="button"
                className="inc-close-button"
                onClick={cerrarObservacion}
                disabled={accionEnCursoId !== null}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleObservar}>
              <div className="inc-detail-content">
                <div className="inc-form-field">
                  <label htmlFor="inc-motivo">
                    ID del motivo de observación *
                  </label>

                  <input
                    id="inc-motivo"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={idMotivo}
                    onChange={(event) =>
                      setIdMotivo(event.target.value)
                    }
                    placeholder="ID registrado en el catálogo"
                  />

                  <small>
                    Ingresa el ID de un motivo existente en el catálogo
                    de motivos de observación.
                  </small>
                </div>

                <div className="inc-form-field">
                  <label htmlFor="inc-comentario">
                    Comentario de la observación *
                  </label>

                  <textarea
                    id="inc-comentario"
                    rows={5}
                    required
                    value={comentario}
                    onChange={(event) =>
                      setComentario(event.target.value)
                    }
                    placeholder="Describe claramente qué información debe corregirse..."
                  />
                </div>

                {errorAccion && (
                  <div className="inc-action-error" role="alert">
                    {errorAccion}
                  </div>
                )}
              </div>

              <footer className="inc-detail-footer">
                <button
                  type="button"
                  className="inc-button inc-button-secondary"
                  onClick={cerrarObservacion}
                  disabled={accionEnCursoId !== null}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inc-button inc-button-observe"
                  disabled={accionEnCursoId !== null}
                >
                  {accionEnCursoId ===
                  incidenciaParaObservar.id_incidencia
                    ? 'Registrando...'
                    : 'Registrar observación'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* DETALLE O FORMULARIO DE EDICIÓN */}
      {incidenciaSeleccionada && incidenciaParaEditar ? (
        <IncidenciaCorrection
          incidencia={incidenciaParaEditar}
          onCancel={cerrarEdicion}
          onSubmit={handleEditar}
        />
      ) : incidenciaSeleccionada ? (
        <IncidenciaDetail
          incidencia={incidenciaSeleccionada}
          onClose={() => {
            if (accionEnCursoId !== null) return;

            setIncidenciaSeleccionada(null);
            setIncidenciaParaEditar(null);
          }}
          onValidar={handleValidar}
          onObservar={abrirObservacion}
          onRechazar={handleRechazar}
          accionEnCurso={
            accionEnCursoId ===
            incidenciaSeleccionada.id_incidencia
          }
          onEditar={abrirEdicion}
          puedeEditar={puedeEditarIncidencias}
        />
      ) : null}
    </main>
  );
}
