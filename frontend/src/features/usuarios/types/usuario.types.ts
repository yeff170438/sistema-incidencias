export type RolUsuario = 'ADMIN' | 'OPERADOR' | 'RESPONSABLE'

export interface Usuario {
  id_usuario: number
  nombre: string
  correo: string
  estado: boolean
  ultimo_acceso: string | null
  fecha_registro: string | null
  id_oficina: number | null
  oficina: string | null
  id_rol: number | null
  rol: RolUsuario | string | null
}

export interface CrearUsuarioPayload {
  nombre: string
  correo: string
  password: string
  id_rol: number
  id_oficina: number | null
}

export interface ActualizarUsuarioPayload {
  nombre: string
  correo: string
  id_rol: number
  id_oficina: number | null
}

export interface CambiarPasswordPayload {
  password: string
}