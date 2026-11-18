export interface Ciudadano {
  id_ciudadano: number
  dni: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  correo: string
  telefono: string | null
  direccion: string | null
  correo_verificado: boolean
  ultimo_acceso: string | null
  fecha_registro: string | null
}

export interface ActualizarCiudadanoPayload {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  correo: string
  telefono: string | null
  direccion: string | null
}

export type FiltroVerificacion =
  | 'todos'
  | 'verificados'
  | 'pendientes'