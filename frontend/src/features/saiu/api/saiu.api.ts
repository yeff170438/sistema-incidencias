
import api from '../../../services/api'
import type {
  SAIU,
  SAIUListResponse,
  SAIUResponse,
} from '../types/saiu.types'

/**
 * Obtiene todas las solicitudes administrativas registradas.
 */
export const getAllSAIU = async (): Promise<SAIU[]> => {
  const response = await api.get<SAIUListResponse>(
    '/solicitudes-incidencias'
  )

  return response.data.data
}

/**
 * Obtiene la solicitud administrativa vinculada a un ticket.
 */
export const getSAIUByTicket = async (
  idTicket: number
): Promise<SAIU> => {
  const response = await api.get<SAIUResponse>(
    `/solicitudes-incidencias/ticket/${idTicket}`
  )

  return response.data.data
}

/**
 * Obtiene el PDF de una solicitud administrativa.
 */
export const getSAIUPdf = async (
  idSAIU: number
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `/solicitudes-incidencias/${idSAIU}/pdf`,
    {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    }
  )

  return response.data
}
