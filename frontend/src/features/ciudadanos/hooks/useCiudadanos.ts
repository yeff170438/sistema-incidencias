import { useCallback, useState } from 'react'
import axios from 'axios'

import {
  getCiudadanos,
  updateCiudadano,
  getHistorialIncidencias,
} from '../api/ciudadanos.api'

import type {
  IncidenciaCiudadano,
} from '../api/ciudadanos.api'

import type {
  Ciudadano,
  ActualizarCiudadanoPayload,
} from '../types/ciudadano.types'

function obtenerMensajeError(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

export function useCiudadanos() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([])
  const [historial, setHistorial] = useState<IncidenciaCiudadano[]>([])

  const [loading, setLoading] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null)

  const loadCiudadanos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCiudadanos()
      setCiudadanos(data)
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          'No se pudieron cargar los ciudadanos.'
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (
    id: number,
    payload: ActualizarCiudadanoPayload
  ): Promise<boolean> => {
    setSaving(true)
    setError(null)

    try {
      await updateCiudadano(id, payload)
      await loadCiudadanos()
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          'No se pudo actualizar el ciudadano.'
        )
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [loadCiudadanos])

  const loadHistorial = useCallback(async (
    idCiudadano: number
  ): Promise<void> => {
    setLoadingHistorial(true)
    setErrorHistorial(null)
    setHistorial([])

    try {
      const data = await getHistorialIncidencias(idCiudadano)
      setHistorial(data)
    } catch (err) {
      setErrorHistorial(
        obtenerMensajeError(
          err,
          'No se pudo cargar el historial de incidencias.'
        )
      )
    } finally {
      setLoadingHistorial(false)
    }
  }, [])

  return {
    ciudadanos,
    historial,
    loading,
    loadingHistorial,
    saving,
    error,
    errorHistorial,
    setError,
    loadCiudadanos,
    loadHistorial,
    update,
  }
}