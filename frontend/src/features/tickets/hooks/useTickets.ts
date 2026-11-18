import { useCallback, useState } from 'react'

import {
  getTickets,
  getTicketById,
  selectAttentionMode,
} from '../api/tickets.api'

import type {
  AttentionMode,
  Ticket,
  TicketListItem,
  SelectAttentionModePayload,
} from '../types/ticket.types'

interface ErrorApi {
  message?: string
  response?: {
    data?: {
      message?: string
    }
  }
}

function obtenerMensajeError(error: unknown, mensajePredeterminado: string) {
  const errorApi = error as ErrorApi

  return (
    errorApi.response?.data?.message ??
    errorApi.message ??
    mensajePredeterminado
  )
}

export function useTickets() {
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const [loading, setLoading] = useState(false)
  const [savingMode, setSavingMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTickets()
      setTickets(data)
    } catch (err: unknown) {
      setError(
        obtenerMensajeError(err, 'No se pudieron cargar los tickets.')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTicketById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTicketById(id)
      setSelectedTicket(data)
      return data
    } catch (err: unknown) {
      setError(
        obtenerMensajeError(err, 'No se pudo cargar el detalle del ticket.')
      )
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const changeAttentionMode = useCallback(
    async (id: number, modalidad: AttentionMode) => {
      setSavingMode(true)
      setError(null)

      try {
        const payload: SelectAttentionModePayload = {
          modalidad_atencion: modalidad,
        }

        await selectAttentionMode(id, payload)

        await loadTickets()

        if (selectedTicket?.id_ticket === id) {
          await loadTicketById(id)
        }
      } catch (err: unknown) {
        setError(
          obtenerMensajeError(
            err,
            'No se pudo seleccionar la modalidad de atención.'
          )
        )
        throw err
      } finally {
        setSavingMode(false)
      }
    },
    [loadTickets, loadTicketById, selectedTicket]
  )

  return {
    tickets,
    selectedTicket,
    loading,
    savingMode,
    error,
    loadTickets,
    loadTicketById,
    changeAttentionMode,
    setSelectedTicket,
  }
}