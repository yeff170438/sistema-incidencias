export interface SAIU {
  id_saiu: number
  codigo_saiu: string
  id_ticket: number
  estado?: string
  fecha_creacion?: string
  fecha_registro?: string
  numero_expediente?: string | null
  expediente?: string | null
  observacion?: string | null
  modalidad_atencion?: string
  [key: string]: unknown
}

export interface SAIUResponse {
  data: SAIU
}

export interface SAIU {
  id_saiu: number
  codigo_saiu: string
  id_ticket: number
  id_usuario?: number
  usuario?: string
  id_oficina?: number | null
  oficina?: string | null
  fecha_generacion?: string
  fecha_creacion?: string
  fecha_registro?: string
  estado_saiu?: string
  estado?: string
  descripcion_estado?: string
  numero_expediente?: string | null
  fecha_expediente?: string | null
  fecha_vinculacion?: string | null
  expediente?: string | null
  observacion?: string | null
  modalidad_atencion?: string
}

export interface SAIUResponse {
  data: SAIU
}

export interface SAIUListResponse {
  data: SAIU[]
}
