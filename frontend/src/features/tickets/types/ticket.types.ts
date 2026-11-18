
export type AttentionMode =
  | 'ATENCION_DIRECTA'
  | 'SOLICITUD_ADMINISTRATIVA'

export interface TicketListItem {
  id_ticket: number
  codigo_ticket: string
  modalidad_atencion: AttentionMode | null
  fecha_creacion: string
  fecha_limite: string | null
  estado: string
  prioridad: string
  codigo_incidencia: string
  titulo: string
  categoria: string
  oficina: string
}

export interface Ticket {
  id_ticket: number
  codigo_ticket: string
  id_incidencia: number
  modalidad_atencion: AttentionMode | null

  fecha_creacion: string
  fecha_limite: string | null
  fecha_resolucion: string | null
  fecha_cierre: string | null
  observacion_cierre: string | null

  id_estado: number
  estado: string
  id_prioridad: number
  prioridad: string

  codigo_incidencia: string
  titulo: string
  descripcion: string
  direccion_texto: string

  id_categoria: number
  categoria: string

  id_oficina: number
  oficina: string
}

export interface SelectAttentionModePayload {
  modalidad_atencion: AttentionMode
}
