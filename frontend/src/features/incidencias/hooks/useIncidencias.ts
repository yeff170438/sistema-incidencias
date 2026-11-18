import { useCallback, useEffect, useState } from 'react';

import { obtenerIncidenciasGestion } from '../services/incidencias.service';

import type { Incidencia } from '../types/incidencias.types';

interface ErrorApi {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useIncidencias = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarIncidencias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await obtenerIncidenciasGestion();
      setIncidencias(resultado.incidencias);
    } catch (err: unknown) {
      const errorApi = err as ErrorApi;

      setError(
        errorApi.response?.data?.message ??
          errorApi.message ??
          'No se pudieron cargar las incidencias.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarIncidencias();
  }, [cargarIncidencias]);

  return {
    incidencias,
    loading,
    error,
    recargar: cargarIncidencias,
  };
};