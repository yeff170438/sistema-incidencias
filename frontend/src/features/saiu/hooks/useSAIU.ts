
import { useCallback, useState } from 'react'
import {
  getAllSAIU,
  getSAIUByTicket,
  getSAIUPdf,
} from '../api/saiu.api'
import type { SAIU } from '../types/saiu.types'

export const useSAIU = () => {
  const [solicitudes, setSolicitudes] = useState<SAIU[]>([])
  const [saiu, setSAIU] = useState<SAIU | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAllSAIU = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const resultado = await getAllSAIU()
      setSolicitudes(resultado)
      return resultado
    } catch (errorApi: unknown) {
      const mensaje =
        errorApi instanceof Error
          ? errorApi.message
          : 'No se pudo cargar el listado de solicitudes administrativas.'

      setError(mensaje)
      throw errorApi
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSAIUByTicket = useCallback(async (idTicket: number) => {
    setLoading(true)
    setError(null)
    setSAIU(null)

    try {
      const resultado = await getSAIUByTicket(idTicket)
      setSAIU(resultado)
      return resultado
    } catch (errorApi: unknown) {
      const mensaje =
        errorApi instanceof Error
          ? errorApi.message
          : 'No se pudo consultar el SAIU asociado al ticket.'

      setError(mensaje)
      throw errorApi
    } finally {
      setLoading(false)
    }
  }, [])

  const openSAIUPdf = useCallback(async (idSAIU: number) => {
    setLoadingPdf(true)
    setError(null)

    const ventana = window.open('', '_blank')

    try {
      const pdf = await getSAIUPdf(idSAIU)

      if (pdf.type && pdf.type !== 'application/pdf') {
        throw new Error('El servidor no devolvió un documento PDF válido.')
      }

      const url = URL.createObjectURL(pdf)

      if (ventana && !ventana.closed) {
        ventana.location.href = url
      } else {
        const enlace = document.createElement('a')
        enlace.href = url
        enlace.target = '_blank'
        enlace.rel = 'noopener noreferrer'
        document.body.appendChild(enlace)
        enlace.click()
        enlace.remove()
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (errorApi: unknown) {
      ventana?.close()

      const mensaje =
        errorApi instanceof Error
          ? errorApi.message
          : 'No se pudo abrir el PDF de la solicitud administrativa.'

      setError(mensaje)
      throw errorApi
    } finally {
      setLoadingPdf(false)
    }
  }, [])

  return {
    solicitudes,
    saiu,
    loading,
    loadingPdf,
    error,
    loadAllSAIU,
    loadSAIUByTicket,
    openSAIUPdf,
  }
}
