import { api } from './api'
import type { Alimento, AlimentoForm } from '@/types'

export const AlimentosService = {
  listar: (params?: { search?: string }) =>
    api.get<Alimento[]>('/alimentos', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Alimento>(`/alimentos/${id}`).then((r) => r.data),

  criar: (data: AlimentoForm) =>
    api.post<Alimento>('/alimentos', data).then((r) => r.data),

  atualizar: (id: string, data: AlimentoForm) =>
    api.put<Alimento>(`/alimentos/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/alimentos/${id}`).then((r) => r.data),
}
