
import api from '../../../services/api'

export interface Atencion {
  id_atencion: number
  id_ticket: number
  id_asignacion: number
  id_oficina: number
  id_usuario: number
  descripcion_atencion: string | null
  resultado: string | null
  conclusion: string | null
  fecha_inicio: string
  fecha_actualizacion: string | null
  fecha_fin: string | null
  codigo_ticket: string
  id_estado_ticket: number
  estado_ticket: string
  id_incidencia: number
  codigo_incidencia: string
  id_ciudadano: number | null
  oficina: string
  usuario: string
}

interface AtencionesResponse {
  atenciones: Atencion[]
}

interface AtencionResponse {
  atencion: Atencion
}

export const obtenerAtenciones = async (): Promise<Atencion[]> => {
  const { data } = await api.get<AtencionesResponse>('/atenciones')
  return data.atenciones
}

export const obtenerAtencionPorId = async (
  id: number,
): Promise<Atencion> => {
  const { data } = await api.get<AtencionResponse>(`/atenciones/${id}`)
  return data.atencion
}
