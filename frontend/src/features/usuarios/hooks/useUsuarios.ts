import { useCallback, useState } from 'react'
import axios from 'axios'

import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  changeUsuarioPassword,
  changeUsuarioStatus,
  deactivateUsuario,
} from '../api/usuarios.api'

import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from '../types/usuario.types'

const obtenerMensajeError = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      fallback
    )
  }

  return error instanceof Error ? error.message : fallback
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudieron cargar los usuarios.')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (
    payload: CrearUsuarioPayload
  ) => {
    setSaving(true)
    setError(null)

    try {
      await createUsuario(payload)
      await loadUsuarios()
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudo crear el usuario.')
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsuarios])

  const update = useCallback(async (
    id: number,
    payload: ActualizarUsuarioPayload
  ) => {
    setSaving(true)
    setError(null)

    try {
      await updateUsuario(id, payload)
      await loadUsuarios()
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudo actualizar el usuario.')
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsuarios])

  const changePassword = useCallback(async (
    id: number,
    password: string
  ) => {
    setSaving(true)
    setError(null)

    try {
      await changeUsuarioPassword(id, { password })
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudo cambiar la contraseña.')
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const changeStatus = useCallback(async (
    id: number,
    estado: boolean
  ) => {
    setSaving(true)
    setError(null)

    try {
      await changeUsuarioStatus(id, estado)
      await loadUsuarios()
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudo cambiar el estado.')
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsuarios])

  const deactivate = useCallback(async (id: number) => {
    setSaving(true)
    setError(null)

    try {
      await deactivateUsuario(id)
      await loadUsuarios()
      return true
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'No se pudo desactivar el usuario.')
      )
      return false
    } finally {
      setSaving(false)
    }
  }, [loadUsuarios])

  return {
    usuarios,
    loading,
    saving,
    error,
    setError,
    loadUsuarios,
    create,
    update,
    changePassword,
    changeStatus,
    deactivate,
  }
}