export interface UsuarioAuth {
  id_usuario: number
  nombre: string
  correo: string
  rol: string
  id_oficina?: number | null
}

export interface LoginResponse {
  token: string
  usuario?: UsuarioAuth
}

export interface AuthContextType {
  usuario: UsuarioAuth | null
  token: string | null
  autenticado: boolean
  cargando: boolean
  login: (
    correo: string,
    password: string,
  ) => Promise<UsuarioAuth>
  logout: () => void
}