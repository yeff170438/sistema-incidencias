import api from '../../../services/api'

import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
  CambiarPasswordPayload,
} from '../types/usuario.types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get<ApiResponse<Usuario[]>>('/usuarios')
  return response.data.data
}

export const getUsuarioById = async (
  id: number
): Promise<Usuario> => {
  const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`)
  return response.data.data
}

export const createUsuario = async (
  payload: CrearUsuarioPayload
): Promise<Usuario> => {
  const response = await api.post<ApiResponse<Usuario>>(
    '/usuarios',
    payload
  )
  return response.data.data
}

export const updateUsuario = async (
  id: number,
  payload: ActualizarUsuarioPayload
): Promise<Usuario> => {
  const response = await api.put<ApiResponse<Usuario>>(
    `/usuarios/${id}`,
    payload
  )
  return response.data.data
}

export const changeUsuarioPassword = async (
  id: number,
  payload: CambiarPasswordPayload
): Promise<void> => {
  await api.patch(`/usuarios/${id}/password`, payload)
}

export const changeUsuarioStatus = async (
  id: number,
  estado: boolean
): Promise<void> => {
  await api.patch(`/usuarios/${id}/status`, { estado })
}

export const deactivateUsuario = async (
  id: number
): Promise<void> => {
  await api.delete(`/usuarios/${id}`)
}