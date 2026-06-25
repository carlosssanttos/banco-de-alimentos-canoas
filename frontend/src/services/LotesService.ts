import { api } from './api'
import type { Lote, LoteForm } from '@/types'

export const LotesService = {
  listar: (params?: { search?: string; status?: string }) =>
    api.get<Lote[]>('/lotes', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Lote>(`/lotes/${id}`).then((r) => r.data),

  criar: (data: LoteForm) =>
    api.post<Lote>('/lotes', data).then((r) => r.data),

  atualizar: (id: string, data: LoteForm) =>
    api.put<Lote>(`/lotes/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/lotes/${id}`).then((r) => r.data),

  vencendo: (dias?: number) =>
    api.get<Lote[]>('/lotes/vencendo', { params: { dias } }).then((r) => r.data),

  marcarEstragado: (id: string) =>
    api.patch<Lote>(`/lotes/${id}/estragado`).then((r) => r.data),
}
