import api from '../../../services/api'

import type {
  Ciudadano,
  ActualizarCiudadanoPayload,
} from '../types/ciudadano.types'

interface ListarCiudadanosResponse {
  ciudadanos: Ciudadano[]
}

interface CiudadanoResponse {
  ciudadano: Ciudadano
  message?: string
}

interface HistorialIncidenciasResponse {
  incidencias: IncidenciaCiudadano[]
  total: number
}

export interface IncidenciaCiudadano {
  id_incidencia: number
  codigo_incidencia: string
  id_ciudadano: number
  titulo: string
  descripcion: string
  direccion_texto: string | null
  fecha_reporte: string
  categoria: string | null
  prioridad: string | null
  estado: string
}

export const getCiudadanos = async (): Promise<Ciudadano[]> => {
  const response = await api.get<ListarCiudadanosResponse>(
    '/ciudadanos'
  )

  return response.data.ciudadanos
}

export const getCiudadanoById = async (
  id: number
): Promise<Ciudadano> => {
  const response = await api.get<CiudadanoResponse>(
    `/ciudadanos/${id}`
  )

  return response.data.ciudadano
}

export const updateCiudadano = async (
  id: number,
  payload: ActualizarCiudadanoPayload
): Promise<Ciudadano> => {
  const response = await api.put<CiudadanoResponse>(
    `/ciudadanos/${id}`,
    payload
  )

  return response.data.ciudadano
}

export const getHistorialIncidencias = async (
  idCiudadano: number
): Promise<IncidenciaCiudadano[]> => {
  const response = await api.get<HistorialIncidenciasResponse>(
    `/incidencias/gestion/ciudadano/${idCiudadano}`
  )

  return response.data.incidencias
}