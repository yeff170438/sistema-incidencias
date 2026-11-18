
import api from '../../../services/api';

import type {
  Incidencia,
  IncidenciasResponse,
  ObservacionIncidenciaData,
  CorreccionIncidenciaData,
} from '../types/incidencias.types';

// =====================================
// CONSULTAR TODAS LAS INCIDENCIAS
// =====================================

export const obtenerIncidenciasGestion =
  async (): Promise<IncidenciasResponse> => {
    const response = await api.get<
      IncidenciasResponse | Incidencia[]
    >('/incidencias/gestion');

    const data = response.data;

    if (Array.isArray(data)) {
      return {
        incidencias: data,
        total: data.length,
      };
    }

    return {
      incidencias: Array.isArray(data.incidencias)
        ? data.incidencias
        : [],
      total:
        typeof data.total === 'number'
          ? data.total
          : data.incidencias?.length ?? 0,
    };
  };

// =====================================
// VALIDAR INCIDENCIA
// =====================================

export const validarIncidencia = async (
  idIncidencia: number
): Promise<void> => {
  await api.patch(
    `/incidencias/${idIncidencia}/validar`
  );
};

// =====================================
// OBSERVAR INCIDENCIA
// =====================================

export const observarIncidencia = async (
  idIncidencia: number,
  datos: ObservacionIncidenciaData
): Promise<void> => {
  await api.patch(
    `/incidencias/${idIncidencia}/observar`,
    datos
  );
};

// =====================================
// RECHAZAR INCIDENCIA
// =====================================

export const rechazarIncidencia = async (
  idIncidencia: number
): Promise<void> => {
  await api.patch(
    `/incidencias/${idIncidencia}/rechazar`
  );
};

// =====================================
// EDITAR INCIDENCIA (ADMINISTRADOR)
// =====================================

export const editarIncidencia = async (
  idIncidencia: number,
  datos: CorreccionIncidenciaData
): Promise<Incidencia> => {
  const response = await api.patch<{
    message: string;
    incidencia: Incidencia;
  }>(
    `/incidencias/${idIncidencia}/editar`,
    datos
  );

  return response.data.incidencia;
};
