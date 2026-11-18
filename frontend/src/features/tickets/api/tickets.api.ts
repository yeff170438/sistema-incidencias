import api from '../../../services/api'

import type {
  Ticket,
  TicketListItem,
  SelectAttentionModePayload,
} from '../types/ticket.types'

export const getTickets = async (): Promise<TicketListItem[]> => {
  const response = await api.get<TicketListItem[]>('/tickets')
  return response.data
}

export const getTicketById = async (
  id: number
): Promise<Ticket> => {
  const response = await api.get<Ticket>(`/tickets/${id}`)
  return response.data
}

export const selectAttentionMode = async (
  id: number,
  data: SelectAttentionModePayload
) => {
  const response = await api.patch(
    `/tickets/${id}/modalidad`,
    data
  )

  return response.data
}