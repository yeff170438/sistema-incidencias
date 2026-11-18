import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import api from '../services/api'
import type {
  AuthContextType,
  LoginResponse,
  UsuarioAuth,
} from '../types/auth.types'

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [usuario, setUsuario] =
    useState<UsuarioAuth | null>(null)

  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  )

  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      const tokenActual = localStorage.getItem('token')

      if (!tokenActual) {
        setCargando(false)
        return
      }

      try {
        const response =
          await api.get<UsuarioAuth>('/auth/profile')

        setUsuario(response.data)
      } catch (error) {
        console.error('Sesión inválida:', error)

        localStorage.removeItem('token')
        setToken(null)
        setUsuario(null)
      } finally {
        setCargando(false)
      }
    }

    verificarSesion()
  }, [])

  const login = async (
    correo: string,
    password: string,
  ): Promise<UsuarioAuth> => {
    const response = await api.post<LoginResponse>(
      '/auth/usuario/login',
      {
        correo,
        password,
      },
    )

    const tokenRecibido = response.data.token

    if (!tokenRecibido) {
      throw new Error('El backend no devolvió un token.')
    }

    localStorage.setItem('token', tokenRecibido)
    setToken(tokenRecibido)

    let usuarioActual = response.data.usuario

    if (!usuarioActual) {
      const profileResponse =
        await api.get<UsuarioAuth>('/auth/profile')

      usuarioActual = profileResponse.data
    }

    if (!usuarioActual) {
      throw new Error(
        'No fue posible obtener los datos del usuario.',
      )
    }

    setUsuario(usuarioActual)

    return usuarioActual
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: Boolean(usuario && token),
        cargando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    )
  }

  return context
}