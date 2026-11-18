
import { useCallback, useEffect, useState } from 'react'
import {
  obtenerAtenciones,
  type Atencion,
} from '../api/atenciones.api'

export const useAtenciones = () => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarAtenciones = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      const datos = await obtenerAtenciones()
      setAtenciones(datos)
    } catch (err: unknown) {
      console.error('Error al cargar atenciones:', err)
      setError('No se pudieron cargar las atenciones.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarAtenciones()
  }, [cargarAtenciones])

  return {
    atenciones,
    cargando,
    error,
    recargar: cargarAtenciones,
  }
}
