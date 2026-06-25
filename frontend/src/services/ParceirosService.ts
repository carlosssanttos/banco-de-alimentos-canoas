import { api } from './api'
import type { Parceiro } from '@/types'

export const ParceirosService = {
  listar: () =>
    api.get<Parceiro[]>('/parceiros').then((r) => r.data),

  criar: (data: Omit<Parceiro, 'id'>) =>
    api.post<Parceiro>('/parceiros', data).then((r) => r.data),

  atualizar: (id: string, data: Omit<Parceiro, 'id'>) =>
    api.put<Parceiro>(`/parceiros/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/parceiros/${id}`).then((r) => r.data),
}
