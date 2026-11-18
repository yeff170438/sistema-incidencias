
export interface Atencion {
  id_atencion: number
  id_ticket: number
  id_asignacion?: number
  id_oficina?: number
  id_usuario?: number

  codigo_ticket?: string
  codigo_incidencia?: string
  titulo?: string
  oficina?: string
  usuario?: string
  estado_ticket?: string

  descripcion_atencion?: string | null
  resultado?: string | null
  conclusion?: string | null

  fecha_inicio: string
  fecha_fin?: string | null
  fecha_actualizacion?: string | null
}

export interface ResumenAtenciones {
  total: number
  enProceso: number
  finalizadas: number
  pendientes: number
}

export interface HistorialAtencionesResponse {
  historial: Atencion[]
}
